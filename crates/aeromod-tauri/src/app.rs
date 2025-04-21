use std::path::{Path, PathBuf};
use std::sync::Mutex;

use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;

use crate::common::addon;
use crate::settings::AppSettings;

#[tauri::command]
pub fn get_addon(state: State<'_, Mutex<AppSettings>>, id: &str) -> Result<addon::Addon, String> {
  let state = state.lock().unwrap();
  let addons = addon::parse_addon(&state, id).map_err(|e| e.to_string())?;

  Ok(addons)
}

#[tauri::command]
pub fn get_addons(state: State<'_, Mutex<AppSettings>>) -> Result<Vec<addon::Addon>, String> {
  let state = state.lock().unwrap();
  let addons = addon::get_addons(&state).map_err(|e| e.to_string())?;

  Ok(addons)
}

#[tauri::command]
pub fn install_addon(app_handle: AppHandle) -> Result<bool, String> {
  let state = app_handle.state::<Mutex<AppSettings>>();
  let settings = state.lock().unwrap();

  let addon_path = match app_handle.dialog().file().blocking_pick_folder() {
    Some(p) => p.into_path().map_err(|e| e.to_string())?,
    None => return Ok(false),
  };

  let name = addon::install_addon(&settings, &addon_path).map_err(|e| e.to_string())?;
  if settings.auto_enable {
    addon::enable_addon(&settings, &name).map_err(|e| e.to_string())?;
  }

  Ok(true)
}

#[tauri::command]
pub fn enable_addon(state: State<'_, Mutex<AppSettings>>, id: &str) -> Result<(), String> {
  let state = state.lock().unwrap();
  addon::enable_addon(&state, id).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
pub fn disable_addon(state: State<'_, Mutex<AppSettings>>, id: &str) -> Result<(), String> {
  let state = state.lock().unwrap();
  addon::disable_addon(&state, id).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
pub fn uninstall_addon(state: State<'_, Mutex<AppSettings>>, id: &str) -> Result<(), String> {
  let state = state.lock().unwrap();
  addon::uninstall_addon(&state, id).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
pub fn rename_addon(
  state: State<'_, Mutex<AppSettings>>,
  id: &str,
  new_id: &str,
) -> Result<(), String> {
  let state = state.lock().unwrap();
  addon::rename_addon(&state, id, new_id).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
pub fn verify_addon(
  state: State<'_, Mutex<AppSettings>>,
  id: &str,
) -> Result<addon::VerificationResult, String> {
  let state = state.lock().unwrap();
  addon::verify_addon(&state, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reveal_addon(app_handle: AppHandle, id: &str) -> Result<(), String> {
  let state = app_handle.state::<Mutex<AppSettings>>();
  let settings = state.lock().unwrap();

  let addon_path = Path::new(&settings.addons_dir).join(id);
  if !addon_path.exists() {
    return Err(format!("Addon '{}' not found in addons directory", id));
  }

  app_handle
    .opener()
    .open_path(addon_path.to_string_lossy(), None::<&str>)
    .map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
pub fn get_onboarding_status(app_handle: AppHandle) -> Result<bool, String> {
  AppSettings::exists(&app_handle).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn complete_onboarding(app_handle: AppHandle, settings: AppSettings) -> Result<(), String> {
  let exists = AppSettings::exists(&app_handle).map_err(|e| e.to_string())?;
  if exists {
    return Err(String::from("Onboarding already completed"));
  }

  let path = AppSettings::path(&app_handle).map_err(|e| e.to_string())?;
  settings.create(path).map_err(|e| e.to_string())?;

  app_handle.manage(Mutex::new(settings));

  Ok(())
}

#[tauri::command]
pub fn get_settings(state: State<'_, Mutex<AppSettings>>) -> Result<AppSettings, String> {
  let settings = state.lock().unwrap().clone();
  Ok(settings)
}

#[tauri::command]
pub fn update_setting(app_handle: AppHandle, key: &str, value: &str) -> Result<(), String> {
  let state = app_handle.state::<Mutex<AppSettings>>();
  let mut settings = state.lock().unwrap();

  match key {
    "addons_dir" => {
      let path = PathBuf::from(value);
      if !path.exists() {
        return Err(format!("Path '{}' does not exist", value));
      }
      if !path.is_dir() {
        return Err(format!("Path '{}' is not a directory", value));
      }
      settings.addons_dir = path;
    }
    "community_dir" => {
      let path = PathBuf::from(value);
      if !path.exists() {
        return Err(format!("Path '{}' does not exist", value));
      }
      if !path.is_dir() {
        return Err(format!("Path '{}' is not a directory", value));
      }
      settings.community_dir = path;
    }
    "auto_enable" => {
      settings.auto_enable = match value {
        "true" => true,
        "false" => false,
        _ => return Err(format!("Invalid value for auto_enable '{}'", value)),
      };
    }
    _ => return Err(format!("Unknown setting key '{}'", key)),
  }

  let settings_path = AppSettings::path(&app_handle).map_err(|e| e.to_string())?;
  settings.save(settings_path).map_err(|e| e.to_string())?;

  Ok(())
}
