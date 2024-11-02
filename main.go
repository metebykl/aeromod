package main

import (
	"embed"
	"log"

	"github.com/metebykl/aeromod/internal/config"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	var conf config.AppConfig
	err := config.Load(&conf)
	if err != nil {
		log.Fatalf("failed to load config: %v\n", err)
	}

	// create an instance of the app structure
	app := NewApp(&conf)

	// create application with options
	err = wails.Run(&options.App{
		Title:     "AeroMod",
		Width:     1280,
		Height:    720,
		MinWidth:  800,
		MinHeight: 450,
		Frameless: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 255},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
		DragAndDrop: &options.DragAndDrop{
			EnableFileDrop: true,
		},
		Windows: &windows.Options{
			DisablePinchZoom:    true,
			EnableSwipeGestures: false,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
