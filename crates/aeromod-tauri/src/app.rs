use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::Serialize;
use sysinfo::System;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
use tauri_plugin_opener::OpenerExt;

use crate::common::addon;
use crate::common::preset::{Preset, PresetManager};
use crate::common::sim::SimManager;
use crate::settings::AppSettings;

#[tauri::command]
pub fn quit_app(app_handle: AppHandle) {
  app_handle.exit(0);
}

#[tauri::command(async)]
pub fn show_about(app_handle: AppHandle) {
  let version = &app_handle.package_info().version;
  let system_name = System::kernel_long_version();
  let info = format!("Version: {}\nOS: {}", version, system_name);

  let info_clone = info.clone();
  let app_handle_clone = app_handle.clone();

  app_handle
    .dialog()
    .message(info)
    .kind(MessageDialogKind::Info)
    .title("AeroMod")
    .buttons(MessageDialogButtons::OkCancelCustom(
      "Copy".to_string(),
      "OK".to_string(),
    ))
    .show(move |result| {
      if result {
        let _ = app_handle_clone.clipboard().write_text(info_clone);
      }
    });
}

#[tauri::command(async)]
pub fn get_addon(state: State<'_, Mutex<AppSettings>>, id: &str) -> Result<addon::Addon, String> {
  let state = state.lock().unwrap().clone();
  let addons = addon::parse_addon(&state, id).map_err(|e| e.to_string())?;

  Ok(addons)
}

#[tauri::command(async)]
pub fn get_addons(state: State<'_, Mutex<AppSettings>>) -> Result<Vec<addon::Addon>, String> {
  let state = state.lock().unwrap().clone();
  let addons = addon::get_addons(&state).map_err(|e| e.to_string())?;

  Ok(addons)
}

#[derive(Serialize)]
#[serde(tag = "status", rename_all = "lowercase")]
pub enum AddonInstallResult {
  Success { id: String },
  Failure { file: String, error: String },
}

#[derive(Serialize)]
pub struct InstallResult {
  pub results: Vec<AddonInstallResult>,
}

#[tauri::command(async)]
pub fn install_addon(app_handle: AppHandle) -> Result<InstallResult, String> {
  let state = app_handle.state::<Mutex<AppSettings>>();
  let settings = state.lock().unwrap().clone();

  let addons: Vec<PathBuf> = match app_handle.dialog().file().blocking_pick_files() {
    Some(addons) => addons
      .into_iter()
      .map(|f| f.into_path().map_err(|e| e.to_string()))
      .collect::<Result<_, _>>()?,
    None => return Ok(InstallResult { results: vec![] }),
  };

  let mut results = Vec::new();

  for addon in addons {
    let file_display = addon
      .file_name()
      .and_then(|n| n.to_str())
      .unwrap_or("<unknown>")
      .to_string();

    match addon::install_addon(&settings, &addon) {
      Ok(id) => {
        if settings.auto_enable {
          if let Err(e) = addon::enable_addon(&settings, &id) {
            results.push(AddonInstallResult::Failure {
              file: file_display,
              error: e.to_string(),
            });
            continue;
          }
        }

        results.push(AddonInstallResult::Success { id });
      }
      Err(e) => {
        results.push(AddonInstallResult::Failure {
          file: file_display,
          error: e.to_string(),
        });
      }
    }
  }

  Ok(InstallResult { results })
}

#[tauri::command(async)]
pub fn enable_addon(state: State<'_, Mutex<AppSettings>>, id: &str) -> Result<(), String> {
  let state = state.lock().unwrap().clone();
  addon::enable_addon(&state, id).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command(async)]
pub fn disable_addon(state: State<'_, Mutex<AppSettings>>, id: &str) -> Result<(), String> {
  let state = state.lock().unwrap().clone();
  addon::disable_addon(&state, id).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command(async)]
pub fn uninstall_addon(state: State<'_, Mutex<AppSettings>>, id: &str) -> Result<(), String> {
  let state = state.lock().unwrap().clone();
  addon::uninstall_addon(&state, id).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command(async)]
pub fn rename_addon(
  state: State<'_, Mutex<AppSettings>>,
  id: &str,
  new_id: &str,
) -> Result<(), String> {
  let state = state.lock().unwrap().clone();
  addon::rename_addon(&state, id, new_id).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command(async)]
pub fn verify_addon(
  state: State<'_, Mutex<AppSettings>>,
  id: &str,
) -> Result<addon::VerificationResult, String> {
  let state = state.lock().unwrap().clone();
  addon::verify_addon(&state, id).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub fn reveal_addon(app_handle: AppHandle, id: &str) -> Result<(), String> {
  let state = app_handle.state::<Mutex<AppSettings>>();
  let settings = state.lock().unwrap().clone();

  let addon_path = Path::new(&settings.addons_dir).join(id);
  if !addon_path.exists() {
    return Err(format!("Addon '{}' not found in addons directory", id));
  }

  app_handle
    .opener()
    .open_path(addon_path.to_string_lossy(), None::<&str>)
    .map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command(async)]
pub fn get_addon_thumbnail(
  state: State<'_, Mutex<AppSettings>>,
  id: &str,
) -> Result<String, String> {
  let state = state.lock().unwrap().clone();
  addon::get_addon_thumbnail(&state, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_onboarding_status(app_handle: AppHandle) -> Result<bool, String> {
  AppSettings::exists(&app_handle).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn complete_onboarding(app_handle: AppHandle, settings: AppSettings) -> Result<(), String> {
  let exists = AppSettings::exists(&app_handle).map_err(|e| e.to_string())?;
  if exists {
    return Err(String::from("Onboarding already completed"));
  }

  let path = AppSettings::path(&app_handle).map_err(|e| e.to_string())?;
  settings.create(path).map_err(|e| e.to_string())?;

  app_handle.manage(Mutex::new(settings));

  Ok(())
}

#[tauri::command]
pub fn get_settings(state: State<'_, Mutex<AppSettings>>) -> Result<AppSettings, String> {
  let settings = state.lock().unwrap().clone();
  Ok(settings)
}

#[tauri::command]
pub fn update_setting(app_handle: AppHandle, key: &str, value: &str) -> Result<(), String> {
  let state = app_handle.state::<Mutex<AppSettings>>();
  let mut settings = state.lock().unwrap();

  match key {
    "addons_dir" => {
      let path = PathBuf::from(value);
      if !path.exists() {
        return Err(format!("Path '{}' does not exist", value));
      }
      if !path.is_dir() {
        return Err(format!("Path '{}' is not a directory", value));
      }
      settings.addons_dir = path;
    }
    "community_dir" => {
      let path = PathBuf::from(value);
      if !path.exists() {
        return Err(format!("Path '{}' does not exist", value));
      }
      if !path.is_dir() {
        return Err(format!("Path '{}' is not a directory", value));
      }
      settings.community_dir = path;
    }
    "auto_enable" => {
      settings.auto_enable = match value {
        "true" => true,
        "false" => false,
        _ => return Err(format!("Invalid value for auto_enable '{}'", value)),
      };
    }
    _ => return Err(format!("Unknown setting key '{}'", key)),
  }

  let settings_path = AppSettings::path(&app_handle).map_err(|e| e.to_string())?;
  settings.save(settings_path).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command(async)]
pub fn clear_rolling_cache(state: State<'_, Mutex<AppSettings>>) -> Result<(), String> {
  let state = state.lock().unwrap().clone();
  SimManager::new(&state)
    .clear_rolling_cache()
    .map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub fn clear_scenery_indexes(state: State<'_, Mutex<AppSettings>>) -> Result<(), String> {
  let state = state.lock().unwrap().clone();
  SimManager::new(&state)
    .clear_scenery_indexes()
    .map_err(|e| e.to_string())
}

fn get_presets_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
  app_handle
    .path()
    .config_dir()
    .map(|p| p.join("AeroMod").join("presets"))
    .map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub fn create_preset(app_handle: AppHandle, preset: Preset) -> Result<(), String> {
  let presets_dir = get_presets_dir(&app_handle)?;
  let manager = PresetManager::new(presets_dir).map_err(|e| e.to_string())?;

  manager.create_preset(preset).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub fn list_presets(app_handle: AppHandle) -> Result<Vec<Preset>, String> {
  let presets_dir = get_presets_dir(&app_handle)?;
  let manager = PresetManager::new(presets_dir).map_err(|e| e.to_string())?;

  manager.list_presets().map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub fn get_preset(app_handle: AppHandle, id: &str) -> Result<Preset, String> {
  let presets_dir = get_presets_dir(&app_handle)?;
  let manager = PresetManager::new(presets_dir).map_err(|e| e.to_string())?;

  manager.get_preset(id).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub fn apply_preset(app_handle: AppHandle, id: &str) -> Result<(), String> {
  let state = app_handle.state::<Mutex<AppSettings>>();
  let settings = state.lock().unwrap().clone();

  let presets_dir = get_presets_dir(&app_handle)?;
  let manager = PresetManager::new(presets_dir).map_err(|e| e.to_string())?;

  let preset = manager.get_preset(id).map_err(|e| e.to_string())?;
  preset.apply(&settings).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub fn update_preset(app_handle: AppHandle, preset: Preset) -> Result<(), String> {
  let presets_dir = get_presets_dir(&app_handle)?;
  let manager = PresetManager::new(presets_dir).map_err(|e| e.to_string())?;

  manager.update_preset(preset).map_err(|e| e.to_string())
}

#[tauri::command(async)]
pub fn remove_preset(app_handle: AppHandle, id: &str) -> Result<(), String> {
  let presets_dir = get_presets_dir(&app_handle)?;
  let manager = PresetManager::new(presets_dir).map_err(|e| e.to_string())?;

  manager.remove_preset(id).map_err(|e| e.to_string())
}
