use std::fs;
use std::fs::File;
use std::path::{Path, PathBuf};

use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AppSettings {
  pub addons_dir: PathBuf,
  pub community_dir: PathBuf,
  pub auto_enable: bool,
}

impl AppSettings {
  pub fn load<P: AsRef<Path>>(path: P) -> Result<AppSettings> {
    let file = File::open(path)?;
    let data: AppSettings = serde_json::from_reader(file)?;
    Ok(data)
  }

  pub fn save<P: AsRef<Path>>(&self, path: P) -> Result<()> {
    let data = serde_json::to_string_pretty(self)?;
    fs::write(path, data)?;
    Ok(())
  }

  pub fn path(app_handle: &AppHandle) -> Result<PathBuf> {
    let config_dir = AppSettings::config_dir(&app_handle)?;
    let path = config_dir.join("settings.json");
    Ok(path)
  }

  pub fn config_dir(app_handle: &AppHandle) -> Result<PathBuf> {
    let path = app_handle.path().config_dir()?.join("AeroMod");
    Ok(path)
  }
}
