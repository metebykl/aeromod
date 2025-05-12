use std::fs;
use std::sync::Mutex;

use aeromod_settings::AppSettings;
use tauri::Manager;

mod app;
mod settings;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let builder = tauri::Builder::default()
    .setup(|app| {
      let app_handle = app.app_handle();

      let config_dir = settings::get_aeromod_config_dir(app_handle).expect("missing config dir");
      fs::create_dir_all(&config_dir).expect("failed to create config dir");

      let exists = settings::app_settings_exists(app_handle).unwrap();
      if exists {
        let settings_path = settings::get_app_settings_path(app_handle).unwrap();
        let settings = AppSettings::load(settings_path).expect("failed to load settings");

        app.manage(Mutex::new(settings));
      }

      Ok(())
    })
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_clipboard_manager::init());

  let app = builder.invoke_handler(tauri::generate_handler![
    app::quit_app,
    app::show_about,
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
    app::get_addon_thumbnail,
    app::clear_rolling_cache,
    app::clear_scenery_indexes,
    app::get_settings,
    app::update_setting,
    app::create_preset,
    app::list_presets,
    app::get_preset,
    app::apply_preset,
    app::update_preset,
    app::remove_preset
  ]);
  app
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
