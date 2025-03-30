use std::fs;
use std::io;
use std::path::Path;

pub fn get_directory_size<P: AsRef<Path>>(path: P) -> io::Result<u64> {
  let mut size = 0;

  for entry in fs::read_dir(path)? {
    let entry = entry?;
    let metadata = entry.metadata()?;

    if metadata.is_file() {
      size += metadata.len();
    } else if metadata.is_dir() {
      size += get_directory_size(&entry.path())?;
    }
  }

  Ok(size)
}
