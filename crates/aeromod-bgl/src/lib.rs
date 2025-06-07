use std::fs::File;
use std::io;
use std::io::{BufReader, Read, Seek, SeekFrom};
use std::path::Path;

use byteorder::{LittleEndian, ReadBytesExt};

struct SectionHeader {
  section_type: u32,
  subsection_size: u32,
  subsection_count: u32,
  subsection_offset: u32,
  _total_subsection_size: u32,
}

pub enum FSSectType {
  Undefined,
  Airport,
  VorIls,
  Ndb,
  Marker,
  Boundary,
  Waypoint,
  Geopol,
  SceneryObject,
  NameList,
  VorIcaoIndex,
  NdbIcaoIndex,
  WaypointIcaoIndex,
  ModelData,
  AirportSummary,
  ExclusionRectangle,
  TimeZone,
  ModelIndex,
  LandmarkLocation,
  CVX,
  DEM,
  Landclass,
  Waterclass,
  Regions,
  Population,
  LCLookup,
  Seasons,
}

impl From<u32> for FSSectType {
  fn from(value: u32) -> Self {
    match value {
      0x3 => FSSectType::Airport,
      0x13 => FSSectType::VorIls,
      0x17 => FSSectType::Ndb,
      0x18 => FSSectType::Marker,
      0x20 => FSSectType::Boundary,
      0x22 => FSSectType::Waypoint,
      0x23 => FSSectType::Geopol,
      0x25 => FSSectType::SceneryObject,
      0x27 => FSSectType::NameList,
      0x28 => FSSectType::VorIcaoIndex,
      0x29 => FSSectType::NdbIcaoIndex,
      0x2a => FSSectType::WaypointIcaoIndex,
      0x2b => FSSectType::ModelData,
      0x2c => FSSectType::AirportSummary,
      0x2e => FSSectType::ExclusionRectangle,
      0x2f => FSSectType::TimeZone,
      0x30 => FSSectType::ModelIndex,
      0x31 => FSSectType::LandmarkLocation,
      0x65 => FSSectType::CVX,
      0x67 => FSSectType::DEM,
      0x68 => FSSectType::Landclass,
      0x69 => FSSectType::Waterclass,
      0x6a => FSSectType::Regions,
      0x6c => FSSectType::Population,
      0x6f => FSSectType::LCLookup,
      0x78 => FSSectType::Seasons,
      _ => FSSectType::Undefined,
    }
  }
}

pub enum FSDataType {
  Undefined,
  Airport,
  GenericBuilding,
  LibraryObject,
  Windsock,
  Effect,
  TaxiwaySign,
  Trigger,
  ExtrusionBridge,
  VorIls,
  WorldScript,
  CarParking,
  Ndb,
  Marker,
  SimObject,
  Boundary,
  Waypoint,
  Geopol,
  SceneryObject,
  NameList,
  VorIcaoIndex,
  NdbIcaoIndex,
  WaypointIcaoIndex,
  ModelData,
  ExclusionRectangle,
  TimeZone,
  AirportSummary,
  CVX,
  DEM,
  Landclass,
  Waterclass,
  Regions,
  Population,
  LCLookup,
  Seasons,
  DeleteNavigation,
  DeleteAirportNavigation,
  LandmarkLocation,
}

impl From<u32> for FSDataType {
  fn from(value: u32) -> Self {
    match value {
      0x56 => FSDataType::Airport,
      0x0A => FSDataType::GenericBuilding,
      0x0B => FSDataType::LibraryObject,
      0x0C => FSDataType::Windsock,
      0x0D => FSDataType::Effect,
      0x0E => FSDataType::TaxiwaySign,
      0x10 => FSDataType::Trigger,
      0x12 => FSDataType::ExtrusionBridge,
      0x13 => FSDataType::VorIls,
      0x15 => FSDataType::WorldScript,
      0x16 => FSDataType::CarParking,
      0x17 => FSDataType::Ndb,
      0x18 => FSDataType::Marker,
      0x19 => FSDataType::SimObject,
      0x20 => FSDataType::Boundary,
      0x22 => FSDataType::Waypoint,
      0x23 => FSDataType::Geopol,
      0x25 => FSDataType::SceneryObject,
      0x27 => FSDataType::NameList,
      0x28 => FSDataType::VorIcaoIndex,
      0x29 => FSDataType::NdbIcaoIndex,
      0x2a => FSDataType::WaypointIcaoIndex,
      0x2b => FSDataType::ModelData,
      0x2e => FSDataType::ExclusionRectangle,
      0x2f => FSDataType::TimeZone,
      0x32 => FSDataType::AirportSummary,
      0x65 => FSDataType::CVX,
      0x67 => FSDataType::DEM,
      0x68 => FSDataType::Landclass,
      0x69 => FSDataType::Waterclass,
      0x6a => FSDataType::Regions,
      0x6c => FSDataType::Population,
      0x6f => FSDataType::LCLookup,
      0x78 => FSDataType::Seasons,
      0xDA => FSDataType::DeleteNavigation,
      0xDB => FSDataType::DeleteAirportNavigation,
      0xEA => FSDataType::LandmarkLocation,
      _ => FSDataType::Undefined,
    }
  }
}

#[derive(Debug)]
pub enum BglObject {
  Airport(Airport),
}

#[derive(Debug)]
pub struct Airport {
  pub icao: String,
  pub latitude: f64,
  pub longitude: f64,
  pub altitude: f64,
  pub runway_count: u8,
}

pub fn parse_bgl<P: AsRef<Path>>(path: P) -> io::Result<Vec<BglObject>> {
  let file = File::open(path)?;
  let mut reader = BufReader::new(file);
  let mut bgl_objects: Vec<BglObject> = Vec::new();

  // Parse BGL file header.
  let _magic_number = reader.read_u32::<LittleEndian>()?;
  let _header_size = reader.read_u32::<LittleEndian>()?;
  reader.seek(SeekFrom::Current(4))?;
  reader.seek(SeekFrom::Current(4))?;
  reader.seek(SeekFrom::Current(4))?;
  let section_count = reader.read_u32::<LittleEndian>()?;
  reader.seek(SeekFrom::Current(32))?;

  // Parse sections.
  let mut sections = Vec::with_capacity(section_count as usize);
  for _ in 0..section_count {
    sections.push(SectionHeader {
      section_type: reader.read_u32::<LittleEndian>()?,
      subsection_size: reader
        .read_u32::<LittleEndian>()
        .map(|s| calculate_subsection_header_size(s))?,
      subsection_count: reader.read_u32::<LittleEndian>()?,
      subsection_offset: reader.read_u32::<LittleEndian>()?,
      _total_subsection_size: reader.read_u32::<LittleEndian>()?,
    });
  }

  for section in sections {
    let mut section_objects: Vec<BglObject> = Vec::new();

    // Parse airport subsections.
    for i in 0..section.subsection_count {
      let subsection_pos = section.subsection_offset as u64 + (i * section.subsection_size) as u64;
      reader.seek(SeekFrom::Start(subsection_pos))?;

      reader.seek(SeekFrom::Current(4))?;
      let _record_count = reader.read_u32::<LittleEndian>()?;
      let data_offset = reader.read_u32::<LittleEndian>()?;
      let _data_size = reader.read_u32::<LittleEndian>()?;

      // Parse subsection records.
      reader.seek(SeekFrom::Start(data_offset as u64))?;
      match FSSectType::from(section.section_type) {
        FSSectType::Airport => {
          let airport = parse_airport_record(&mut reader)?;
          section_objects.push(BglObject::Airport(airport));
        }
        _ => {}
      }

      bgl_objects.append(&mut section_objects);
    }
  }

  Ok(bgl_objects)
}

fn parse_airport_record<R: Read + Seek>(reader: &mut R) -> io::Result<Airport> {
  let _record_type = reader.read_u16::<LittleEndian>()?;
  let _record_size = reader.read_u32::<LittleEndian>()?;

  let runway_count = reader.read_u8()?;
  reader.seek(SeekFrom::Current(1))?; // commCt
  reader.seek(SeekFrom::Current(1))?; // startCt
  reader.seek(SeekFrom::Current(1))?; // appCt
  reader.seek(SeekFrom::Current(1))?; // legacyApronCt
  reader.seek(SeekFrom::Current(1))?; // helipadCt

  let lon_raw = reader.read_u32::<LittleEndian>()?;
  let lat_raw = reader.read_u32::<LittleEndian>()?;
  let (lon, lat) = calculate_lon_lat(lon_raw, lat_raw);

  let alt_raw = reader.read_i32::<LittleEndian>()?;
  let alt = alt_raw as f64 / 1000.0;
  reader.seek(SeekFrom::Current(4))?; // towerLon
  reader.seek(SeekFrom::Current(4))?; // towerLat
  reader.seek(SeekFrom::Current(4))?; // towerAlt
  reader.seek(SeekFrom::Current(4))?; // magvar

  let ident = reader
    .read_u32::<LittleEndian>()
    .map(|i| calculate_icao_code(i, true))?;

  Ok(Airport {
    icao: ident,
    latitude: lat,
    longitude: lon,
    altitude: alt,
    runway_count,
  })
}

fn calculate_subsection_header_size(value: u32) -> u32 {
  ((value & 0x10000) | 0x40000) >> 0x0E
}

fn calculate_lon_lat(lon_raw: u32, lat_raw: u32) -> (f64, f64) {
  const NORMALIZATION_FACTOR: f64 = 0x10000000 as f64;

  let lon_f64 = lon_raw as f64;
  let lat_f64 = lat_raw as f64;

  let lon_deg = (lon_f64 * (360.0 / (3.0 * NORMALIZATION_FACTOR))) - 180.0;
  let lat_deg = 90.0 - lat_f64 * (180.0 / (2.0 * NORMALIZATION_FACTOR));

  (lon_deg, lat_deg)
}

fn calculate_icao_code(mut value: u32, is_airport_ident: bool) -> String {
  // Airport identifiers are shifted left by 5 bits.
  if is_airport_ident {
    value >>= 5;
  }

  // If the initial value is 0, it represents a single blank space.
  if value == 0 {
    return " ".to_string();
  }

  let mut coded_chars: Vec<u32> = Vec::new();

  // The decoding process uses modulo 38 to extract the character codes
  // in reverse order.
  while value > 0 {
    let remainder = value % 38;
    coded_chars.push(remainder);
    value /= 38; // Integer division
  }

  // The character codes are in reverse order (L-to-R).
  coded_chars
    .iter()
    .rev()
    .map(|&code| {
      match code {
        0 => ' ',
        // 0-9 => 2-11
        2..=11 => char::from_u32('0' as u32 + (code - 2)).unwrap(),
        // A-Z => 12-37
        12..=37 => char::from_u32('A' as u32 + (code - 12)).unwrap(),
        // 1 => '?'
        _ => '?',
      }
    })
    .collect()
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_calculate_lon_lat() {
    let (encoded_lon, encoded_lat) = (466970081, 145327076);
    let (lon, lat) = calculate_lon_lat(encoded_lon, encoded_lat);
    assert_eq!(lon, 28.751893490552902);
    assert_eq!(lat, 41.275300830602646);
  }

  #[test]
  fn test_calculate_icao_code() {
    let encoded_icao = 0x27e6c41;
    let icao = calculate_icao_code(encoded_icao, true);
    assert_eq!(icao, "LTFM");
  }
}
