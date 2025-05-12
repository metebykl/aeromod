use std::fs;
use std::fs::File;
use std::path::{Path, PathBuf};

use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AppSettings {
  pub addons_dir: PathBuf,
  pub community_dir: PathBuf,
  pub auto_enable: bool,
}

impl AppSettings {
  pub fn create<P: AsRef<Path>>(&self, path: P) -> Result<()> {
    let file = File::create(path)?;
    serde_json::to_writer_pretty(file, self)?;
    Ok(())
  }

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
}
