use std::fs::File;
use std::io;
use std::io::{BufReader, Read, Seek, SeekFrom};
use std::path::Path;

use anyhow::Result;
use byteorder::{LittleEndian, ReadBytesExt};

struct SectionHeader {
  section_type: u32,
  subsection_size: u32,
  subsection_count: u32,
  subsection_offset: u32,
  total_subsection_size: u32,
}

pub fn parse_bgl<P: AsRef<Path>>(path: P) -> Result<String> {
  let file = File::open(path)?;
  let mut reader = BufReader::new(file);

  // Parse BGL File Header
  let magic_number = reader.read_u32::<LittleEndian>()?;
  let header_size = reader.read_u32::<LittleEndian>()?;
  reader.seek(SeekFrom::Current(4))?;
  reader.seek(SeekFrom::Current(4))?;
  reader.seek(SeekFrom::Current(4))?;
  let section_count = reader.read_u32::<LittleEndian>()?;
  reader.seek(SeekFrom::Current(32))?;

  println!("Magic Number: {}", magic_number);
  println!("Size: {}", header_size);
  println!("Section Count: {}", section_count);

  // Parse Sections
  let mut sections = Vec::with_capacity(section_count as usize);
  for _ in 0..section_count {
    sections.push(SectionHeader {
      section_type: reader.read_u32::<LittleEndian>()?,
      subsection_size: reader
        .read_u32::<LittleEndian>()
        .map(|s| calculate_subsection_header_size(s))?,
      subsection_count: reader.read_u32::<LittleEndian>()?,
      subsection_offset: reader.read_u32::<LittleEndian>()?,
      total_subsection_size: reader.read_u32::<LittleEndian>()?,
    });
  }

  for section in sections {
    println!("\nSECTION");

    println!("| Section Type: {:#x}", section.section_type);
    println!("| Subsection Size: {}", section.subsection_size);
    println!("| Subsection Count: {}", section.subsection_count);
    println!("| Subsection Offset: {}", section.subsection_offset);
    println!("| Total Subsection Size: {}", section.total_subsection_size);

    // Parse Airport Subsections
    if section.section_type == 0x3 {
      for i in 0..section.subsection_count {
        let subsection_pos =
          section.subsection_offset as u64 + (i * section.subsection_size) as u64;
        reader.seek(SeekFrom::Start(subsection_pos))?;

        reader.seek(SeekFrom::Current(4))?;
        let record_count = reader.read_u32::<LittleEndian>()?;
        let data_offset = reader.read_u32::<LittleEndian>()?;
        let data_size = reader.read_u32::<LittleEndian>()?;

        println!("| SUBSECTION");

        println!("| | Record Count: {}", record_count);
        println!("| | Data Offset: {}", data_offset);
        println!("| | Data Size: {}", data_size);

        // Parse Records
        reader.seek(SeekFrom::Start(data_offset as u64))?;
        parse_airport(&mut reader)?;

        println!("| END SUBSECTION");
      }
    }

    println!("END SECTION");
  }

  Ok("XXXX".to_string())
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

fn parse_airport<R: Read + Seek>(reader: &mut R) -> io::Result<()> {
  let record_type = reader.read_u16::<LittleEndian>()?;
  let record_size = reader.read_u32::<LittleEndian>()?;

  let runway_count = reader.read_u8()?;
  reader.seek(SeekFrom::Current(1))?; // commCt
  reader.seek(SeekFrom::Current(1))?; // startCt
  reader.seek(SeekFrom::Current(1))?; // appCt
  reader.seek(SeekFrom::Current(1))?; // legacyApronCt
  reader.seek(SeekFrom::Current(1))?; // helipadCt

  let lon = reader.read_u32::<LittleEndian>()?;
  let lat = reader.read_u32::<LittleEndian>()?;
  let (lon, lat) = calculate_lon_lat(lon, lat);

  reader.seek(SeekFrom::Current(4))?; // alt
  reader.seek(SeekFrom::Current(4))?; // towerLon
  reader.seek(SeekFrom::Current(4))?; // towerLat
  reader.seek(SeekFrom::Current(4))?; // towerAlt
  reader.seek(SeekFrom::Current(4))?; // magvar
  let ident = reader.read_u32::<LittleEndian>()?;

  println!("| | AIRPORT");

  println!("| | | Record Type: {:#x}", record_type);
  println!("| | | Record Size: {}", record_size);
  println!("| | | Runway Count: {}", runway_count);
  println!("| | | Lat: {}", lat);
  println!("| | | Lon: {}", lon);
  println!("| | | Ident: {}", ident);

  println!("| | END AIRPORT");

  Ok(())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_parse_airport_icao() {
    let res = parse_bgl("../../test.bgl").unwrap();
    assert_eq!(res, "XXXX");
  }
}
