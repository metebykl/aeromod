use std::sync::Mutex;

use tauri::State;

use crate::common::addon;
use crate::settings::AppSettings;

#[tauri::command]
pub fn get_addons(state: State<'_, Mutex<AppSettings>>) -> Result<Vec<addon::Addon>, String> {
  let state = state.lock().unwrap();
  let addons = addon::get_addons(&state).map_err(|e| e.to_string())?;

  Ok(addons)
}
