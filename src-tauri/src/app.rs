use std::sync::Mutex;

use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::DialogExt;

use crate::common::addon;
use crate::settings::AppSettings;

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

  addon::install_addon(&settings, &addon_path).map_err(|e| e.to_string())?;
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
