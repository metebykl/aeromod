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
      let app_handle = app.app_handle();

      let config_dir = AppSettings::config_dir(app_handle).expect("missing config dir");
      fs::create_dir_all(&config_dir).expect("failed to create config dir");

      let exists = AppSettings::exists(app_handle).unwrap();
      if exists {
        let settings_path = AppSettings::path(app_handle).unwrap();
        let settings = AppSettings::load(settings_path).expect("failed to load settings");

        app.manage(Mutex::new(settings));
      }

      Ok(())
    })
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init());

  let app = builder.invoke_handler(tauri::generate_handler![
    app::get_onboarding_status,
    app::complete_onboarding,
    app::get_addon,
    app::get_addons,
    app::install_addon,
    app::enable_addon,
    app::disable_addon,
    app::uninstall_addon,
    app::rename_addon,
    app::verify_addon,
    app::reveal_addon,
    app::get_settings,
    app::update_setting
  ]);
  app
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
