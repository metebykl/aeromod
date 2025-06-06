use std::fs::File;
use std::io::{BufReader, Seek, SeekFrom};
use std::path::Path;

use anyhow::Result;
use byteorder::{LittleEndian, ReadBytesExt};

pub fn parse_airport_icao<P: AsRef<Path>>(path: P) -> Result<String> {
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
  for _ in 0..section_count {
    let section_type = reader.read_u32::<LittleEndian>()?;
    let subsection_size = reader.read_u32::<LittleEndian>()?;
    let subsection_count = reader.read_u32::<LittleEndian>()?;
    let first_subsection_offset = reader.read_u32::<LittleEndian>()?;
    let total_subsection_size = reader.read_u32::<LittleEndian>()?;

    println!("-- SECTION --");

    println!("Section Type: {:#x}", section_type);
    println!("Subsection Size: {}", subsection_size);
    println!("Subsection Count: {}", subsection_count);
    println!("First Subsection Offset: {}", first_subsection_offset);
    println!("Total Subsection Size: {}", total_subsection_size);

    // Parse Subsection

    println!("-- END SECTION --");
  }

  Ok("XXXX".to_string())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_parse_airport_icao() {
    let res = parse_airport_icao("../../test.bgl").unwrap();
    assert_eq!(res, "XXXX");
  }
}
