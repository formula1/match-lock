use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};
// use hyper::{Body, Client, Method, Request};
// use hyperlocal::{UnixClientExt, Uri};

// Global state for the IPC server process
static IPC_SERVER: Mutex<Option<Child>> = Mutex::new(None);
static IPC_SOCKET_PATH: Mutex<Option<PathBuf>> = Mutex::new(None);

fn parse_ipc_socket(output: &str) -> Option<PathBuf> {
    for line in output.lines() {
        if line.starts_with("IPC_SOCKET:") {
            if let Some(path_str) = line.strip_prefix("IPC_SOCKET:") {
                return Some(PathBuf::from(path_str));
            }
        }
    }
    None
}

#[tauri::command]
pub async fn start_ipc_server(app: AppHandle) -> Result<String, String> {
    // Check if server is already running
    {
        let server_guard = IPC_SERVER.lock().unwrap();
        if server_guard.is_some() {
            let socket_guard = IPC_SOCKET_PATH.lock().unwrap();
            if let Some(path) = socket_guard.as_ref() {
                return Ok(path.to_string_lossy().to_string());
            }
        }
    }

    // Get the path to the compiled IPC server
    let app_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;

    let ipc_script_path = app_dir.join("dist-ipc").join("index.js");

    if !ipc_script_path.exists() {
        return Err(format!(
            "IPC server script not found at: {}. Make sure to run 'npm run build:ipc' first.",
            ipc_script_path.display()
        ));
    }

    // Generate a unique socket path in temp directory
    let socket_path = std::env::temp_dir().join(format!("matchlock-ipc-{}.sock", std::process::id()));

    println!("🚀 Starting IPC server...");
    println!("📄 Script: {}", ipc_script_path.display());
    println!("🔌 Socket: {}", socket_path.display());

    // Start the Node.js IPC server process with socket path
    let mut cmd = Command::new("node");
    cmd.arg(&ipc_script_path)
        .arg(&socket_path) // Pass socket path as argument
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| {
        format!("Failed to start IPC server process: {}. Make sure Node.js is installed.", e)
    })?;

    // Read the first few lines of stdout to get the socket path
    use std::io::{BufRead, BufReader};
    use std::time::{Duration, Instant};

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let mut reader = BufReader::new(stdout);
    let mut line = String::new();

    let start_time = Instant::now();
    let timeout = Duration::from_secs(10);
    let mut server_socket_path: Option<PathBuf> = None;

    // Read lines until we find the socket path or timeout
    while start_time.elapsed() < timeout {
        line.clear();
        match reader.read_line(&mut line) {
            Ok(0) => break, // EOF
            Ok(_) => {
                let trimmed = line.trim();
                println!("📡 IPC: {}", trimmed);

                if let Some(path) = parse_ipc_socket(trimmed) {
                    server_socket_path = Some(path);
                    break;
                }
            }
            Err(e) => {
                return Err(format!("Failed to read IPC server output: {}", e));
            }
        }

        // Check if process is still running
        match child.try_wait() {
            Ok(Some(status)) => {
                return Err(format!("IPC server process exited early with status: {}", status));
            }
            Ok(None) => {
                // Process is still running, continue reading
            }
            Err(e) => {
                return Err(format!("Failed to check IPC server process status: {}", e));
            }
        }

        std::thread::sleep(Duration::from_millis(100));
    }

    let server_socket_path = server_socket_path.ok_or("Failed to get socket path from IPC server")?;

    // Store the process and socket path
    {
        let mut server_guard = IPC_SERVER.lock().unwrap();
        *server_guard = Some(child);
    }
    {
        let mut socket_guard = IPC_SOCKET_PATH.lock().unwrap();
        *socket_guard = Some(server_socket_path.clone());
    }

    println!("✅ IPC server started successfully on socket: {}", server_socket_path.display());
    Ok(server_socket_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn stop_ipc_server() -> Result<(), String> {
    let mut server_guard = IPC_SERVER.lock().unwrap();
    if let Some(mut child) = server_guard.take() {
        match child.kill() {
            Ok(_) => {
                println!("🛑 IPC server stopped");
                // Clear the socket path
                let mut socket_guard = IPC_SOCKET_PATH.lock().unwrap();
                *socket_guard = None;
                Ok(())
            }
            Err(e) => Err(format!("Failed to stop IPC server: {}", e)),
        }
    } else {
        Err("IPC server is not running".to_string())
    }
}

#[tauri::command]
pub fn get_ipc_socket_path() -> Result<String, String> {
    let socket_guard = IPC_SOCKET_PATH.lock().unwrap();
    socket_guard.as_ref()
        .map(|path| path.to_string_lossy().to_string())
        .ok_or_else(|| "IPC server not started".to_string())
}

// Cleanup function to be called when the app is closing
pub fn cleanup_ipc_server() {
    let _ = stop_ipc_server();
}

/*
#[tauri::command]
pub async fn ipc_request(method: String, path: String, body: Option<String>) -> Result<String, String> {
    let socket_path = get_ipc_socket_path()?;

    // Create Unix client
    let client = Client::unix();

    // Create the URI for Unix socket
    let uri = Uri::new(&socket_path, &path);

    // Create the HTTP method
    let http_method = match method.to_uppercase().as_str() {
        "GET" => Method::GET,
        "POST" => Method::POST,
        "PUT" => Method::PUT,
        "DELETE" => Method::DELETE,
        _ => return Err(format!("Unsupported HTTP method: {}", method)),
    };

    // Build the request
    let mut request_builder = Request::builder()
        .method(http_method)
        .uri(uri);

    // Add body if provided
    let request_body = if let Some(body_str) = body {
        request_builder = request_builder.header("Content-Type", "application/json");
        Body::from(body_str)
    } else {
        Body::empty()
    };

    let request = request_builder
        .body(request_body)
        .map_err(|e| format!("Failed to build request: {}", e))?;

    // Send the request
    let response = client
        .request(request)
        .await
        .map_err(|e| format!("IPC request failed: {}", e))?;

    let status = response.status();
    let response_bytes = hyper::body::to_bytes(response.into_body())
        .await
        .map_err(|e| format!("Failed to read IPC response: {}", e))?;

    let response_text = String::from_utf8(response_bytes.to_vec())
        .map_err(|e| format!("Invalid UTF-8 in response: {}", e))?;

    if !status.is_success() {
        return Err(format!("IPC server error ({}): {}", status, response_text));
    }

    Ok(response_text)
}
*/