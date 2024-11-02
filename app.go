package main

import (
	"context"
	"fmt"
	"log"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/metebykl/aeromod/internal/config"
	"github.com/metebykl/aeromod/internal/msfs"
	"github.com/metebykl/aeromod/utils"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const (
	CONFIG_COMMUNITY_FOLDER  = "community_folder"
	CONFIG_MOD_FOLDER        = "mod_folder"
	CONFIG_ENABLE_ON_INSTALL = "enable_on_install"
)

type App struct {
	ctx           context.Context
	config        *config.AppConfig
	setupComplete bool
	msfsClient    *msfs.Client
}

func NewApp(config *config.AppConfig) *App {
	return &App{config: config}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	err := a.createMSFSClient()
	if err != nil {
		return
	}

	a.setupComplete = true
}

func (a *App) reloadConfig() error {
	err := config.Load(a.config)
	if err != nil {
		return err
	}

	if err := a.createMSFSClient(); err != nil {
		log.Printf("failed to update msfs client: %v\n", err)
	}

	return nil
}

func (a *App) createMSFSClient() error {
	communityFolder := a.config.CommunityFolder
	if communityFolder == "" {
		return fmt.Errorf("community folder path cannot be empty")
	}

	modFolder := a.config.ModFolder
	if modFolder == "" {
		return fmt.Errorf("mod folder path cannot be empty")
	}

	a.msfsClient = msfs.NewClient(communityFolder, modFolder)
	return nil
}

func (a *App) IsSetupComplete() bool {
	return a.setupComplete
}

func (a *App) GetSettings() config.AppConfig {
	return *a.config
}

func (a *App) SetSetting(key string, val interface{}) error {
	err := config.Set(key, val)
	if err != nil {
		return err
	}

	return a.reloadConfig()
}

func (a *App) FindSimCommunityFolder() (string, error) {
	path, found := msfs.FindSimCommunityFolder()
	if !found {
		return "", fmt.Errorf("failed to find sim community directory")
	}

	return path, nil
}

func (a *App) CompleteSetup(communityPath, modPath string) error {
	if communityPath == "" {
		return fmt.Errorf("community folder path cannot be empty")
	}

	if modPath == "" {
		return fmt.Errorf("mod folder path cannot be empty")
	}

	if err := config.Set(CONFIG_COMMUNITY_FOLDER, communityPath); err != nil {
		return err
	}

	if err := config.Set(CONFIG_MOD_FOLDER, modPath); err != nil {
		return err
	}

	if err := a.reloadConfig(); err != nil {
		return fmt.Errorf("failed to reload config")
	}

	a.setupComplete = true
	return nil
}

func (a *App) GetModNames() []string {
	if a.msfsClient == nil {
		return []string{}
	}
	return a.msfsClient.GetModNames()
}

func (a *App) GetAllMods() []msfs.Mod {
	if a.msfsClient == nil {
		return []msfs.Mod{}
	}

	var mods []msfs.Mod
	modNames := a.msfsClient.GetModNames()

	for _, name := range modNames {
		enabled, err := a.msfsClient.IsModEnabled(name)
		if err != nil {
			log.Printf("failed to check mod status: %v\n", err)
			mods = append(mods, msfs.Mod{Name: name, Type: "UNKNOWN", Creator: "", Version: "", Enabled: false})
			continue
		}

		manifest, err := a.msfsClient.ParsePackageManifest(name)
		if err != nil {
			log.Printf("failed to parse mod manifest: %v\n", err)
			mods = append(mods, msfs.Mod{Name: name, Type: "UNKNOWN", Creator: "", Version: "", Enabled: enabled})
			continue
		}

		ct := strings.ToUpper(strings.TrimSpace(manifest.ContentType))
		if ct == "" {
			ct = "UNKNOWN"
		}

		creator := strings.TrimSpace(manifest.Creator)
		if creator == "" {
			creator = "Unknown"
		}

		version := strings.TrimSpace(manifest.PackageVersion)
		if version == "" {
			version = "0.0.0"
		}

		mods = append(mods, msfs.Mod{
			Name:    name,
			Type:    ct,
			Creator: creator,
			Version: version,
			Enabled: enabled,
		})
	}

	return mods
}

func (a *App) GetModManifest(packageName string) msfs.PackageManifest {
	if a.msfsClient == nil {
		return msfs.PackageManifest{}
	}

	manifest, err := a.msfsClient.ParsePackageManifest(packageName)
	if err != nil {
		log.Printf("failed to parse package manifest: %v\n", err)
		return msfs.PackageManifest{}
	}

	return *manifest
}

func (a *App) EnableMod(modName string) error {
	if a.msfsClient == nil {
		return fmt.Errorf("msfs client not initialized")
	}

	if err := a.msfsClient.EnableMod(modName); err != nil {
		return fmt.Errorf("error enabling mod: %w", err)
	}

	return nil
}

func (a *App) DisableMod(modName string) error {
	if a.msfsClient == nil {
		return fmt.Errorf("msfs client not initialized")
	}

	if err := a.msfsClient.DisableMod(modName); err != nil {
		return fmt.Errorf("error disabling mod: %w", err)
	}

	return nil
}

func (a *App) UninsallMod(modName string) error {
	if a.msfsClient == nil {
		return fmt.Errorf("msfs client not initialized")
	}

	enabled, err := a.msfsClient.IsModEnabled(modName)
	if err != nil {
		log.Printf("failed to check mod status: %v\n", err)
		return fmt.Errorf("failed to check mod status: %w", err)
	}

	if enabled {
		err := a.msfsClient.DisableMod(modName)
		if err != nil {
			return fmt.Errorf("error disabling mod: %w", err)
		}
	}

	if err := a.msfsClient.UninstallMod(modName); err != nil {
		return fmt.Errorf("error uninstalling mod: %w", err)
	}

	return nil
}

func (a *App) OpenDirectoryDialog(title string) (string, error) {
	dirPath, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: title,
	})

	if err != nil {
		return "", fmt.Errorf("failed to open directory dialog: %w", err)
	}

	return dirPath, nil
}

func (a *App) GetModThumbnail(modName string) (string, error) {
	if a.msfsClient == nil {
		return "", fmt.Errorf("msfs client not initialized")
	}

	thumbnail, err := a.msfsClient.GetModThumbnailBase64(modName)
	if err != nil {
		return "", fmt.Errorf("failed to get mod thumbnail: %w", err)
	}

	return thumbnail, nil
}

func (a *App) InstallMod(path string) (bool, error) {
	var archive string

	// open a file dialog if no path is specified
	if path == "" {
		var err error
		archive, err = runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
			Title: "Choose Mod",
		})

		if err != nil {
			return false, fmt.Errorf("failed to open directory dialog: %w", err)
		}
	} else {
		archive = path
	}

	if archive == "" {
		return false, nil
	}

	ext := filepath.Ext(archive)
	if ext != ".zip" {
		return false, fmt.Errorf("unsupported archive format")
	}

	archiveDest := strings.TrimSuffix(archive, ext)

	err := utils.Unzip(archive, archiveDest)
	if err != nil {
		return false, err
	}

	defer func() {
		err := utils.Rmdir(archiveDest)
		if err != nil {
			log.Printf("failed to cleanup extracted archive: %s\n", filepath.Base(archiveDest))
		}
	}()

	mods, err := msfs.FindMods(archiveDest)
	if err != nil {
		return false, fmt.Errorf("failed to find mods: %w", err)
	}

	if len(mods) < 1 {
		return false, nil
	}

	for _, m := range mods {
		name := filepath.Base(m)
		err := utils.CopyDir(m, filepath.Join(a.config.ModFolder, name))
		if err != nil {
			log.Printf("failed to move mod: %v\n", err)
			continue
		}

		if a.config.EnableOnInstall {
			err = a.EnableMod(name)
			if err != nil {
				log.Printf("failed to enable mod: %v\n", err)
			}
		}
	}

	return true, nil
}

func (a *App) VerifyMod(name string) ([]msfs.VerificationResult, error) {
	result, err := a.msfsClient.VerifyMod(name)
	if err != nil {
		log.Println(err)
		return []msfs.VerificationResult{}, err
	}

	return result, nil
}

func (a *App) RevealMod(name string) error {
	cmd := exec.Command("explorer", a.msfsClient.GetModPath(name))
	// cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd.Run()
}
