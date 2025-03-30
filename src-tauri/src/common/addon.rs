use std::fs;
use std::path::Path;

use anyhow::{Result, anyhow};
use serde::{Deserialize, Serialize};

use crate::common::manifest;
use crate::settings::AppSettings;
use crate::utils;

#[derive(Serialize, Deserialize)]
pub struct Addon {
  pub id: String,
  pub name: String,
  pub creator: String,
  pub version: String,
  pub content_type: String,
  pub enabled: bool,
  pub size: u64,
}

pub fn parse_addon(settings: &AppSettings, id: &str) -> Result<Addon> {
  let path = Path::new(&settings.addons_dir).join(id);
  let size = utils::get_directory_size(&path).unwrap_or(0);

  if !path.exists() {
    return Err(anyhow!("Addon '{}' not found in addons directory", id));
  }

  if !path.is_dir() {
    return Err(anyhow!("Not a directory"));
  };

  let manifest = manifest::parse_manifest(&path.join("manifest.json"))?;
  let enabled = Path::new(&settings.community_dir).join(id).exists();

  Ok(Addon {
    id: id.to_string(),
    name: manifest.title,
    creator: manifest.creator,
    version: manifest.package_version,
    content_type: manifest.content_type,
    enabled,
    size,
  })
}

pub fn get_addons(settings: &AppSettings) -> Result<Vec<Addon>> {
  let mut addons: Vec<Addon> = Vec::new();

  for entry in fs::read_dir(&settings.addons_dir)? {
    let path = entry?.path();
    let name = match path.file_name() {
      Some(n) => n.to_string_lossy().into_owned(),
      None => {
        continue;
      }
    };

    if let Ok(addon) = parse_addon(&settings, &name) {
      addons.push(addon);
    }
  }

  Ok(addons)
}
