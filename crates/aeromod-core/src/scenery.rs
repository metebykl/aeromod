use std::fs::File;
use std::io::{BufReader, BufWriter};
use std::path::{Path, PathBuf};

use aeromod_bgl::{BglObject, load_bgl_objects};
use aeromod_settings::AppSettings;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use walkdir::WalkDir;

use crate::addon;

#[derive(Clone, Serialize, Deserialize)]
pub struct SceneryCache {
  #[serde(skip)]
  path: PathBuf,
  airports: Vec<AirportScenery>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct AirportScenery {
  pub addon_id: String,
  pub bgl_path: String,
  pub icao: String,
  pub latitude: f64,
  pub longitude: f64,
  pub altitude: f64,
  pub runway_count: u8,
}

impl SceneryCache {
  pub fn new<P: AsRef<Path>>(path: P) -> Self {
    Self {
      path: path.as_ref().to_path_buf(),
      airports: Vec::new(),
    }
  }

  pub fn load<P: AsRef<Path>>(path: P) -> Result<Self> {
    let path = path.as_ref();
    if !path.exists() {
      return Ok(Self {
        path: path.to_path_buf(),
        airports: Vec::new(),
      });
    }

    let file = File::open(path)?;
    let reader = BufReader::new(file);
    let mut scenery_cache: Self = serde_json::from_reader(reader)?;
    scenery_cache.path = path.to_path_buf();

    Ok(scenery_cache)
  }

  pub fn save(&self) -> Result<()> {
    let file = File::create(&self.path)?;
    let writer = BufWriter::new(file);
    serde_json::to_writer_pretty(writer, self)?;
    Ok(())
  }

  pub fn build(&mut self, settings: &AppSettings) -> Result<()> {
    self.airports.clear();

    let addons = addon::get_addons(settings)?;
    for addon in addons {
      let addon_path = &settings.addons_dir.join(&addon.id);
      for entry in WalkDir::new(addon_path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |ext| ext == "bgl"))
      {
        let path = entry.path();
        let bgl_objects = match load_bgl_objects(path) {
          Ok(b) => b,
          Err(_) => {
            continue;
          }
        };

        for obj in bgl_objects {
          match obj {
            BglObject::Airport(airport) => {
              self.airports.push(AirportScenery {
                addon_id: addon.id.to_string(),
                bgl_path: path.to_string_lossy().to_string(),
                icao: airport.icao,
                latitude: airport.latitude,
                longitude: airport.longitude,
                altitude: airport.altitude,
                runway_count: airport.runway_count,
              });
            }
          }
        }
      }
    }

    Ok(())
  }

  pub fn all_airports(&self) -> &Vec<AirportScenery> {
    &self.airports
  }

  pub fn is_empty(&self) -> bool {
    self.airports.is_empty()
  }
}
