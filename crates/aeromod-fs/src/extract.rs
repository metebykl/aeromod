use std::fs;
use std::fs::File;
use std::io;
use std::io::{Read, Seek};
use std::path::Path;

use anyhow::{Result, anyhow};
use zip::ZipArchive;

pub fn extract_archive(archive_path: &Path, target_dir: &Path) -> Result<()> {
  fs::create_dir_all(target_dir)?;

  let file = File::open(archive_path)?;
  let archive_type = archive_path
    .extension()
    .and_then(|e| e.to_str())
    .unwrap_or("");

  match archive_type {
    "zip" => extract_zip_archive(file, target_dir),
    _ => Err(anyhow!("Unsupported archive type: '{}'", archive_type)),
  }
}

fn extract_zip_archive<R: Read + Seek>(reader: R, target_dir: &Path) -> Result<()> {
  let mut archive = ZipArchive::new(reader)?;

  for i in 0..archive.len() {
    let mut file = archive.by_index(i)?;
    let file_path = match file.enclosed_name() {
      Some(path) => path,
      None => continue,
    };

    let target_path = target_dir.join(file_path);

    if file.is_dir() {
      fs::create_dir_all(&target_path)?;
    } else {
      if let Some(p) = target_path.parent() {
        if !p.exists() {
          fs::create_dir_all(p)?;
        }
      }

      let mut out_file = File::create(&target_path)?;
      io::copy(&mut file, &mut out_file)?;
    }

    // Set permissions (Unix only)
    #[cfg(unix)]
    {
      use std::os::unix::fs::PermissionsExt;
      if let Some(mode) = file.unix_mode() {
        // Check if it's a symlink, don't chmod symlinks directly
        fs::set_permissions(&target_path, fs::Permissions::from_mode(mode))?;
      }
    }
  }

  Ok(())
}
