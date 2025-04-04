use std::fs;
use std::sync::Mutex;

use tauri::Manager;

use settings::AppSettings;

mod app;
mod common;
mod settings;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let builder = tauri::Builder::default()
    .setup(|app| {
      let paths = app.path();

      let config_dir = paths
        .config_dir()
        .expect("missing config dir")
        .join("AeroMod");
      fs::create_dir_all(&config_dir).expect("failed to create config dir");

      // TODO: implement onboarding logic
      let settings =
        AppSettings::load(config_dir.join("settings.json")).expect("failed to load settings");
      app.manage(Mutex::new(settings));

      Ok(())
    })
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init());

  let app = builder.invoke_handler(tauri::generate_handler![
    app::get_addons,
    app::install_addon,
    app::enable_addon,
    app::disable_addon
  ]);
  app
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
