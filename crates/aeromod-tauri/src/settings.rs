use std::fs;
use std::path::PathBuf;

use anyhow::Result;
use tauri::{AppHandle, Manager as _};

pub fn get_app_settings_path(app_handle: &AppHandle) -> Result<PathBuf> {
  let config_dir = get_aeromod_config_dir(app_handle)?;
  let path = config_dir.join("settings.json");
  Ok(path)
}

pub fn app_settings_exists(app_handle: &AppHandle) -> Result<bool> {
  let path = get_app_settings_path(app_handle)?;
  let exists = fs::exists(path)?;
  Ok(exists)
}

pub fn get_aeromod_config_dir(app_handle: &AppHandle) -> Result<PathBuf> {
  let path = app_handle.path().config_dir()?.join("AeroMod");
  Ok(path)
}
