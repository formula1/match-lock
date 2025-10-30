use serde_json::Value;
use std::process::Command;
use tauri::AppHandle;

async fn run_storage_sidecar(command: &str, args: &[&str]) -> Result<String, String> {
    let mut cmd = Command::new("npx");
    cmd.arg("tsx")
        .arg("sidecars/storage.ts")
        .arg(command);

    for arg in args {
        cmd.arg(arg);
    }

    let output = cmd.output()
        .map_err(|e| format!("Failed to execute storage sidecar: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Storage sidecar failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(stdout.trim().to_string())
}

#[tauri::command]
pub async fn storage_get(_app: AppHandle, key: String) -> Result<Option<Value>, String> {
    let result = run_storage_sidecar("get", &[&key]).await?;

    if result == "null" {
        Ok(None)
    } else {
        let value: Value = serde_json::from_str(&result)
            .map_err(|e| format!("Failed to parse storage result: {}", e))?;
        Ok(Some(value))
    }
}

#[tauri::command]
pub async fn storage_set(_app: AppHandle, key: String, value: Value) -> Result<(), String> {
    let value_str = serde_json::to_string(&value)
        .map_err(|e| format!("Failed to serialize value: {}", e))?;

    let result = run_storage_sidecar("set", &[&key, &value_str]).await?;

    let success: bool = serde_json::from_str(&result)
        .map_err(|e| format!("Failed to parse storage result: {}", e))?;

    if success {
        Ok(())
    } else {
        Err("Storage set operation failed".to_string())
    }
}

#[tauri::command]
pub async fn storage_remove(_app: AppHandle, key: String) -> Result<(), String> {
    let result = run_storage_sidecar("remove", &[&key]).await?;

    let success: bool = serde_json::from_str(&result)
        .map_err(|e| format!("Failed to parse storage result: {}", e))?;

    if success {
        Ok(())
    } else {
        Err("Storage remove operation failed".to_string())
    }
}

#[tauri::command]
pub async fn storage_keys(_app: AppHandle) -> Result<Vec<String>, String> {
    let result = run_storage_sidecar("keys", &[]).await?;

    let keys: Vec<String> = serde_json::from_str(&result)
        .map_err(|e| format!("Failed to parse storage keys result: {}", e))?;

    Ok(keys)
}

#[tauri::command]
pub async fn storage_clear(_app: AppHandle) -> Result<(), String> {
    let result = run_storage_sidecar("clear", &[]).await?;

    let success: bool = serde_json::from_str(&result)
        .map_err(|e| format!("Failed to parse storage clear result: {}", e))?;

    if success {
        Ok(())
    } else {
        Err("Storage clear operation failed".to_string())
    }
}
