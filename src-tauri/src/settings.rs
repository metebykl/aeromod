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
  pub fn load<P: AsRef<Path>>(path: P) -> Result<AppSettings> {
    let file = File::open(path)?;
    let data: AppSettings = serde_json::from_reader(file)?;

    Ok(data)
  }
}
