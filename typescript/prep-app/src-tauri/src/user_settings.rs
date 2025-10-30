use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct InitResult {
    pub shouldShowDialog: bool,
    pub matchLockDir: String,
}

async fn run_user_settings_sidecar(command: &str, args: &[&str]) -> Result<String, String> {
    let mut cmd = Command::new("npx");
    cmd.arg("tsx")
        .arg("sidecars/user-settings.ts")
        .arg(command);

    for arg in args {
        cmd.arg(arg);
    }

    let output = cmd.output()
        .map_err(|e| format!("Failed to execute user settings sidecar: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("User settings sidecar failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(stdout.trim().to_string())
}

#[tauri::command]
pub async fn initialize_user_directories(_app: AppHandle) -> Result<InitResult, String> {
    let result = run_user_settings_sidecar("initialize", &[]).await?;

    let init_result: InitResult = serde_json::from_str(&result)
        .map_err(|e| format!("Failed to parse initialization result: {}", e))?;

    // Return the result to the frontend, let React handle the dialog
    Ok(init_result)
}

#[tauri::command]
pub async fn handle_user_choice(_app: AppHandle, choice: String, matchLockDir: String) -> Result<bool, String> {
    let result = run_user_settings_sidecar("handleChoice", &[&choice, &matchLockDir]).await?;

    let success: bool = serde_json::from_str(&result)
        .map_err(|e| format!("Failed to parse choice result: {}", e))?;

    Ok(success)
}


