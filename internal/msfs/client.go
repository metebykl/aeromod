package msfs

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/metebykl/aeromod/utils"
)

type Client struct {
	config *ClientConfig
}

type ClientConfig struct {
	communityFolder string
	modFolder       string
}

func NewClient(communityFolder, modFolder string) *Client {
	return &Client{
		config: &ClientConfig{
			communityFolder: communityFolder,
			modFolder:       modFolder,
		},
	}
}

func (c *Client) GetModNames() []string {
	folders, err := utils.Readdir(c.config.modFolder)
	if err != nil {
		return nil
	}

	var mods []string
	for _, e := range folders {
		mods = append(mods, e.Name())
	}

	return mods
}

func (c *Client) EnableMod(modName string) error {
	modSource := filepath.Join(c.config.modFolder, modName)
	modLink := filepath.Join(c.config.communityFolder, modName)
	enabled, err := utils.IsJunction(modLink)
	if err != nil {
		return err
	}

	// mod is already enabled
	if enabled {
		return nil
	}

	return utils.CreateJunction(modSource, modLink)
}

func (c *Client) DisableMod(modName string) error {
	modLink := filepath.Join(c.config.communityFolder, modName)
	enabled, err := utils.IsJunction(modLink)
	if err != nil {
		return err
	}

	// mod is already disabled
	if !enabled {
		return nil
	}

	return utils.RemoveJunction(modLink)
}

func (c *Client) UninstallMod(name string) error {
	modPath := filepath.Join(c.config.modFolder, name)
	return utils.Rmdir(modPath)
}

func (c *Client) IsModEnabled(modName string) (bool, error) {
	modLink := filepath.Join(c.config.communityFolder, modName)
	return utils.IsJunction(modLink)
}

func (c *Client) GetModPath(modName string) string {
	return filepath.Join(c.config.modFolder, modName)
}

func (c *Client) GetModThumbnailBase64(modName string) (string, error) {
	modPath := filepath.Join(c.config.modFolder, modName)
	thumbnailPath := filepath.Join(modPath, "ContentInfo", modName, "Thumbnail.jpg")
	if _, err := os.Stat(thumbnailPath); errors.Is(err, os.ErrNotExist) {
		return "", fmt.Errorf("mod: %s, doesnt have a thumbnail", modName)
	}

	return utils.Base64EncodeFile(thumbnailPath)
}

// VerifyMod checks if the files match their expected properties.
func (c *Client) VerifyMod(name string) ([]VerificationResult, error) {
	modBase := filepath.Join(c.config.modFolder, name)
	layoutFile, err := os.Open(filepath.Join(modBase, "layout.json"))
	if err != nil {
		return nil, err
	}

	defer layoutFile.Close()

	byteValue, _ := io.ReadAll(layoutFile)

	var modLayout ModLayout
	err = json.Unmarshal(byteValue, &modLayout)
	if err != nil {
		return nil, err
	}

	results := make([]VerificationResult, 0)
	for _, fileInfo := range modLayout.Content {
		filePath := filepath.Join(modBase, fileInfo.Path)
		result := VerificationResult{Path: fileInfo.Path}

		// check if the file exists
		fileStat, err := os.Stat(filePath)
		if err != nil {
			if os.IsNotExist(err) {
				result.Error = fmt.Sprintf("File %s does not exist.", filePath)
				results = append(results, result)
				continue
			} else {
				result.Error = fmt.Sprintf("Unable to access file %s: %v", filePath, err)
				results = append(results, result)
				continue
			}
		}

		result.Found = true

		// check file size
		result.Size = fileStat.Size()
		result.SizeOk = result.Size == fileInfo.Size
		if !result.SizeOk {
			result.Error = fmt.Sprintf("File %s size mismatch. Expected %d bytes, got %d bytes.",
				fileInfo.Path, fileInfo.Size, fileStat.Size())
		}

		results = append(results, result)
	}
	return results, nil
}
