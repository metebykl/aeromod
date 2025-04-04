use std::ffi::OsStr;
use std::fs;
use std::path::Path;

use anyhow::{Context, Result, anyhow};
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

pub fn install_addon(settings: &AppSettings, src: &Path) -> Result<String> {
  if !src.exists() {
    return Err(anyhow!("Directory '{}' does not exist", src.display()));
  }

  // TODO: extract archives
  if !src.is_dir() {
    match src.extension().and_then(OsStr::to_str) {
      Some("zip") => {
        return Err(anyhow!("ZIP installation not yet implemented"));
      }
      Some("rar") => {
        return Err(anyhow!("RAR installation not yet implemented"));
      }
      _ => {
        return Err(anyhow!("Path '{}' is not a directory", src.display()));
      }
    }
  }

  let manifest_path = src.join("manifest.json");
  if !manifest_path.exists() {
    return Err(anyhow!("No manifest.json found in '{}'", src.display()));
  }

  let id = src.file_name().context("Failed to get file name")?;

  let dst = Path::new(&settings.addons_dir).join(id);
  if dst.exists() {
    return Err(anyhow!(
      "Addon '{}' already exists in the addons directory",
      id.to_string_lossy()
    ));
  }

  utils::copy_dir_all(src, &dst).context("Failed to copy addon files")?;

  let id = id.to_str().context("Failed to convert id to string")?;
  Ok(id.to_string())
}

pub fn enable_addon(settings: &AppSettings, id: &str) -> Result<()> {
  let addon_path = Path::new(&settings.addons_dir).join(id);
  if !addon_path.exists() {
    return Err(anyhow!("Addon '{}' not found in addons directory", id));
  }

  let target_path = Path::new(&settings.community_dir).join(id);
  if target_path.exists() {
    return Err(anyhow!(
      "Addon '{}' is already enabled or a file with that name exists in the community folder",
      id
    ));
  }

  utils::symlink_dir(addon_path, target_path).context("Failed to create symlink")?;
  Ok(())
}

pub fn disable_addon(settings: &AppSettings, id: &str) -> Result<()> {
  let addon_path = Path::new(&settings.addons_dir).join(id);
  if !addon_path.exists() {
    return Err(anyhow!("Addon '{}' not found in addons directory", id));
  }

  let target_path = Path::new(&settings.community_dir).join(id);
  if !target_path.exists() {
    return Err(anyhow!(
      "Addon '{}' is not enabled or does not exist in the community folder",
      id
    ));
  }

  utils::remove_symlink_dir(target_path).context("Failed to remove symlink")?;
  Ok(())
}
