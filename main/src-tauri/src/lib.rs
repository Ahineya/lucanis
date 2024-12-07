use tauri::Manager;
use tauri::path::BaseDirectory;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, my_custom_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn my_custom_command(handle: tauri::AppHandle) -> String {
    // // Call another async function and wait for it to finish
    // some_async_function().await;
    //
    // let mut llm = Llama::new().await.unwrap();
    // let prompt = "The following is a 300 word essay about Paris:";
    // print!("{}", prompt);
    //
    // let text_completion = llm.generate_text(prompt).await.expect("Failed to generate text");
    //
    // text_completion
    "Hello from my_custom_command".to_string()
}

async fn some_async_function() {

}