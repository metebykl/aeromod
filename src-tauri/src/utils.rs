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

pub fn copy_dir_all<P: AsRef<Path>, U: AsRef<Path>>(from: P, to: U) -> io::Result<()> {
  let to = to.as_ref();
  if !to.exists() {
    fs::create_dir_all(to)?;
  }

  for entry in fs::read_dir(from)? {
    let entry = entry?;
    let path = entry.path();
    let dest_path = to.join(entry.file_name());

    if path.is_dir() {
      copy_dir_all(path, dest_path)?;
    } else {
      fs::copy(path, dest_path)?;
    }
  }

  Ok(())
}
