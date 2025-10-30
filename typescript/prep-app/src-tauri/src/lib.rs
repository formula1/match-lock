mod fs_commands;
mod storage_commands;
mod user_settings;

use fs_commands::*;
use storage_commands::*;
use user_settings::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_os::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      // File system operations
      fs_read_file,
      fs_write_file,
      fs_remove_file,
      fs_mkdir,
      fs_mkdir_all,
      fs_exists,
      fs_get_home_dir,
      fs_get_app_data_dir,
      fs_get_documents_dir,
      fs_get_downloads_dir,
      fs_get_match_lock_dir,
      fs_read_dir,
      fs_stat,
      fs_start_walk_stream,
      // Storage operations
      storage_get,
      storage_set,
      storage_remove,
      storage_keys,
      storage_clear,
      // User settings operations
      initialize_user_directories,
      handle_user_choice
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
