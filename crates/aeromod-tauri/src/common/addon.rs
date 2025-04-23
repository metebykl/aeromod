use std::fs;
use std::fs::File;
use std::path::Path;

use anyhow::{Context, Result, anyhow};
use serde::{Deserialize, Serialize};
use tempfile::tempdir;
use walkdir::WalkDir;

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

  let tmp_guard = tempdir()?;

  let search_dir = if src.is_dir() {
    src.to_path_buf()
  } else {
    aeromod_fs::extract_archive(src, tmp_guard.path())?;
    tmp_guard.path().to_path_buf()
  };

  let mut addon_dir = None;
  for entry in WalkDir::new(&search_dir) {
    let entry = entry?;
    let path = entry.path();
    let file_name = entry.file_name();

    if path.is_file() && file_name == "manifest.json" {
      addon_dir = path.parent().map(|p| p.to_path_buf());
      break;
    }
  }

  let addon_dir = addon_dir.context(format!(
    "No manifest.json found in '{}'",
    search_dir.display()
  ))?;

  let id = addon_dir
    .file_name()
    .context("Failed to get addon directory name")?;

  let dst = Path::new(&settings.addons_dir).join(id);
  if dst.exists() {
    return Err(anyhow!(
      "Addon '{}' already exists in the addons directory",
      id.to_string_lossy()
    ));
  }

  utils::copy_dir_all(&addon_dir, &dst).context("Failed to copy addon files")?;

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

pub fn uninstall_addon(settings: &AppSettings, id: &str) -> Result<()> {
  let addon = parse_addon(settings, id)?;
  if addon.enabled {
    disable_addon(settings, id)?;
  }

  let addon_path = Path::new(&settings.addons_dir).join(id);
  if !addon_path.exists() {
    return Err(anyhow!("Addon '{}' not found in addons directory", id));
  }

  fs::remove_dir_all(addon_path)?;

  Ok(())
}

pub fn rename_addon(settings: &AppSettings, id: &str, new_id: &str) -> Result<()> {
  let addon = parse_addon(settings, id)?;

  let was_enabled = addon.enabled;
  if was_enabled {
    disable_addon(settings, id)?;
  }

  let old_path = Path::new(&settings.addons_dir).join(id);
  if !old_path.exists() {
    return Err(anyhow!("Addon '{}' not found in addons directory", id));
  }

  let new_path = Path::new(&settings.addons_dir).join(new_id);
  if new_path.exists() {
    return Err(anyhow!("Addon '{}' already exists", id));
  }

  fs::rename(old_path, new_path)?;

  if was_enabled {
    enable_addon(settings, new_id)?;
  }

  Ok(())
}

#[derive(Serialize, Deserialize)]
struct Layout {
  content: Vec<LayoutContent>,
}

#[derive(Serialize, Deserialize)]
struct LayoutContent {
  path: String,
  size: u64,
  date: u64,
}

#[derive(Serialize, Deserialize)]
pub struct VerificationResult {
  pub verified: bool,
  pub files: Vec<VerificationNode>,
}

#[derive(Serialize, Deserialize)]
pub struct VerificationNode {
  pub status: VerificationStatus,
  pub path: String,
  pub size: u64,
}

#[derive(Serialize, Deserialize)]
pub enum VerificationStatus {
  Ok,
  SizeMismatch,
  NotFound,
}

pub fn verify_addon(settings: &AppSettings, id: &str) -> Result<VerificationResult> {
  let addon_path = Path::new(&settings.addons_dir).join(id);
  if !addon_path.exists() {
    return Err(anyhow!("Addon '{}' not found in addons directory", id));
  }

  let layout_path = addon_path.join("layout.json");
  if !layout_path.exists() {
    return Err(anyhow!("Addon '{}' does not have a layout.json file", id));
  }

  let file = File::open(layout_path)?;
  let layout: Layout = serde_json::from_reader(file)?;

  let mut verified = true;
  let mut files: Vec<VerificationNode> = Vec::new();

  for content in &layout.content {
    let file_path = addon_path.join(&content.path);

    match fs::metadata(file_path) {
      Ok(metadata) => {
        let status = if metadata.len() == content.size {
          VerificationStatus::Ok
        } else {
          verified = false;
          VerificationStatus::SizeMismatch
        };

        files.push(VerificationNode {
          status,
          path: content.path.clone(),
          size: metadata.len(),
        });
      }
      Err(_) => {
        verified = false;
        files.push(VerificationNode {
          status: VerificationStatus::NotFound,
          path: content.path.clone(),
          size: content.size,
        });
      }
    }
  }

  Ok(VerificationResult { verified, files })
}
