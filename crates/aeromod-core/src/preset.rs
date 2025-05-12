use std::collections::HashSet;
use std::fs;
use std::fs::File;
use std::path::{Path, PathBuf};

use aeromod_settings::AppSettings;
use anyhow::{Result, bail};
use serde::{Deserialize, Serialize};

use crate::addon;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Preset {
  pub id: String,
  pub name: String,
  pub description: Option<String>,
  pub addons: Vec<String>,
}

impl Preset {
  pub fn apply(&self, settings: &AppSettings) -> Result<()> {
    let addons_in_preset: HashSet<_> = self.addons.iter().collect();
    let current_addons = addon::get_addons(settings)?;

    for a in current_addons {
      let should_be_enabled = addons_in_preset.contains(&a.id);
      if should_be_enabled != a.enabled {
        if should_be_enabled {
          let _ = addon::enable_addon(settings, &a.id);
        } else {
          let _ = addon::disable_addon(settings, &a.id)?;
        }
      }
    }

    Ok(())
  }
}

pub struct PresetManager {
  pub path: PathBuf,
}

impl PresetManager {
  pub fn new<P: AsRef<Path>>(path: P) -> Result<Self> {
    let path = path.as_ref().to_path_buf();
    if !path.exists() {
      fs::create_dir_all(&path)?;
    }

    Ok(PresetManager { path })
  }

  pub fn create_preset(&self, preset: Preset) -> Result<()> {
    let id = slugify(&preset.name);

    let new_preset = Preset {
      id,
      name: preset.name,
      description: preset.description,
      addons: preset.addons,
    };

    let preset_path = self.preset_file(&new_preset.id);
    if preset_path.exists() {
      bail!("Preset '{}' already exists", new_preset.id);
    }

    let data = serde_json::to_string_pretty(&new_preset)?;
    fs::write(preset_path, data)?;

    Ok(())
  }

  pub fn list_presets(&self) -> Result<Vec<Preset>> {
    let mut presets = Vec::new();

    for entry in fs::read_dir(&self.path)? {
      let entry = entry?;
      let path = entry.path();

      if path.is_file() && path.extension().is_some_and(|ext| ext == "json") {
        let file = File::open(&path)?;
        let preset: Preset = serde_json::from_reader(file)?;
        presets.push(preset);
      }
    }

    Ok(presets)
  }

  pub fn get_preset(&self, id: &str) -> Result<Preset> {
    let path = self.preset_file(id);
    let file = File::open(path)?;

    let preset: Preset = serde_json::from_reader(file)?;
    Ok(preset)
  }

  pub fn update_preset(&self, preset: Preset) -> Result<()> {
    let preset_path = self.preset_file(&preset.id);
    if !preset_path.exists() {
      bail!("Preset '{}' not found", preset.id);
    }

    let data = serde_json::to_string_pretty(&preset)?;
    fs::write(preset_path, data)?;

    Ok(())
  }

  pub fn remove_preset(&self, id: &str) -> Result<()> {
    let preset_path = self.preset_file(id);
    if !preset_path.exists() {
      bail!("Preset '{}' not found", id);
    }

    fs::remove_file(preset_path)?;
    Ok(())
  }

  fn preset_file(&self, id: &str) -> PathBuf {
    self.path.join(format!("{}.json", id))
  }
}

fn slugify(name: &str) -> String {
  name
    .trim()
    .to_lowercase()
    .replace(|c: char| !c.is_ascii_alphanumeric() && c != ' ', "")
    .replace(' ', "-")
}

#[cfg(test)]
mod tests {
  use super::*;
  use tempfile::tempdir;

  #[test]
  fn test_new_preset_manager_creates_directory() {
    let dir = tempdir().unwrap();

    let non_existent_path = dir.path().join("presets_test_dir");
    assert!(!non_existent_path.exists());

    let manager = PresetManager::new(&non_existent_path);
    assert!(manager.is_ok());
    assert!(non_existent_path.exists());
    assert!(non_existent_path.is_dir());
  }
}
