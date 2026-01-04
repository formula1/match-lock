mod fs_commands;
// mod ipc_manager;
mod native_storage_commands;

use fs_commands::*;
// use ipc_manager::*;
use native_storage_commands::*;

#[tauri::command]
fn console_log(level: String, message: String) {
  match level.as_str() {
    "error" => eprintln!("🔴 [JS ERROR] {}", message),
    "warn" => println!("🟡 [JS WARN] {}", message),
    "info" => println!("🔵 [JS INFO] {}", message),
    _ => println!("⚪ [JS LOG] {}", message),
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let builder = tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_os::init());

  // Enable debugging features in development
  #[cfg(debug_assertions)]
  {
    use std::env;
    // Set environment variables for WebKit debugging
    env::set_var("WEBKIT_INSPECTOR_SERVER", "127.0.0.1:9222");
    env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
  }

  builder
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;

        println!("🔧 Debug mode enabled");
        println!("🔧 Console output will appear in this terminal");

        // Try to enable WebKit inspector on Linux
        #[cfg(target_os = "linux")]
        {
          use std::env;
          env::set_var("WEBKIT_INSPECTOR_SERVER", "127.0.0.1:9222");
          println!("🔧 WebKit inspector enabled on port 9222");
          println!("🔧 Try: http://localhost:9222 in your browser");
        }

        println!("🔧 Alternative debugging:");
        println!("🔧 1. Use console.log() - output appears in this terminal");
        println!("🔧 2. Open http://localhost:5173 in Chrome (limited - no Tauri APIs)");
      }

      /*
      // Start the IPC server
      let app_handle = app.handle().clone();
      tauri::async_runtime::spawn(async move {
        if let Err(e) = start_ipc_server(app_handle).await {
          eprintln!("❌ Failed to start IPC server: {}", e);
        }
      });
      */

      Ok(())
    })

    .invoke_handler(tauri::generate_handler![
      // Console bridge
      console_log,
      // File system operations
      fs_read_file,
      fs_read_file_chunk,
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

      // File system Constants
      fs_home_dir,

      /*
      // IPC management
      start_ipc_server,
      stop_ipc_server,
      get_ipc_socket_path,
      ipc_request,
      */

      // Native storage operations
      native_storage_set,
      native_storage_get,
      native_storage_remove,
      native_storage_keys,
      native_storage_clear,

      /*
      // Storage operations (will be replaced by IPC calls)
      storage_get,
      storage_set,
      storage_remove,
      storage_keys,
      storage_clear,
      */
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
