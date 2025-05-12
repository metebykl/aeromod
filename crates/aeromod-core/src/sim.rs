use std::fs;
use std::path::PathBuf;

use aeromod_settings::AppSettings;
use anyhow::{Context, Result, bail};

pub struct SimManager<'a> {
  settings: &'a AppSettings,
}

impl<'a> SimManager<'a> {
  pub fn new(settings: &'a AppSettings) -> Self {
    Self { settings }
  }

  pub fn clear_rolling_cache(&self) -> Result<()> {
    let sim_path = self.sim_path().context("Failed to find sim directory")?;

    let rolling_cache_path = sim_path.join("ROLLINGCACHE.CCC");
    if !rolling_cache_path.exists() {
      bail!("Rolling cache file not found");
    }

    fs::remove_file(rolling_cache_path)?;
    Ok(())
  }

  pub fn clear_scenery_indexes(&self) -> Result<()> {
    let sim_path = self.sim_path().context("Failed to find sim directory")?;

    let scenery_index_dir = sim_path.join("SceneryIndexes");
    if !scenery_index_dir.exists() {
      bail!("Scenery indexes directory not found");
    }

    fs::remove_dir_all(scenery_index_dir)?;
    Ok(())
  }

  fn sim_path(&self) -> Option<PathBuf> {
    self
      .settings
      .community_dir
      .parent()?
      .parent()
      .map(PathBuf::from)
  }
}
