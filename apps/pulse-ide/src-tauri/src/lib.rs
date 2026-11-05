mod catalog;
mod graph;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(graph::GraphState::default())
        .invoke_handler(tauri::generate_handler![
            catalog::get_node_catalog,
            graph::get_graph,
            graph::apply_graph_action
        ])
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running Pulse IDE");
}
