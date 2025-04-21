use std::fs::File;
use std::io::BufReader;
use std::path::Path;

use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Manifest {
  pub dependencies: Vec<Dependency>,
  pub content_type: String,
  pub title: String,
  pub manufacturer: String,
  pub creator: String,
  pub package_version: String,
  pub minimum_game_version: String,
}

#[derive(Serialize, Deserialize)]
pub struct Dependency {
  pub name: String,
  pub package_version: String,
}

pub fn parse_manifest<P: AsRef<Path>>(path: P) -> Result<Manifest> {
  let file = File::open(path)?;
  let reader = BufReader::new(file);
  let manifest: Manifest = serde_json::from_reader(reader)?;
  Ok(manifest)
}
