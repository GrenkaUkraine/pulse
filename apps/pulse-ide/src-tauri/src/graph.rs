use pulse_core::{graph::Graph, node::NodePosition, value::Value};
use pulse_nodes::catalog;
use serde::{Deserialize, Serialize};
use std::{
    collections::{HashMap, VecDeque},
    sync::Mutex,
};
use tauri::State;
use uuid::Uuid;

pub(crate) struct GraphState(Mutex<EditorState>);

struct EditorState {
    graph: Graph,
    undo: VecDeque<Graph>,
    redo: Vec<Graph>,
}

impl Default for GraphState {
    fn default() -> Self {
        Self(Mutex::new(EditorState {
            graph: Graph::new("Untitled").expect("valid graph name"),
            undo: VecDeque::new(),
            redo: Vec::new(),
        }))
    }
}
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct NodeInstance {
    id: Uuid,
    type_id: String,
    label: Option<String>,
    enabled: bool,
    position: NodePosition,
    values: HashMap<String, Value>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct GraphConnection {
    id: Uuid,
    source: Uuid,
    source_handle: String,
    target: Uuid,
    target_handle: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct GraphSnapshot {
    nodes: Vec<NodeInstance>,
    edges: Vec<GraphConnection>,
    can_undo: bool,
    can_redo: bool,
}

impl From<&EditorState> for GraphSnapshot {
    fn from(state: &EditorState) -> Self {
        let graph = &state.graph;
        let mut nodes: Vec<_> = graph
            .nodes()
            .map(|node| NodeInstance {
                id: node.id(),
                type_id: node.node_type().to_owned(),
                label: node.label().map(str::to_owned),
                enabled: node.enabled(),
                position: NodePosition {
                    x: node.position().x,
                    y: node.position().y,
                },
                values: node.values().clone(),
            })
            .collect();
        nodes.sort_by_key(|node| node.id);
        let edges = graph
            .connections()
            .map(|edge| GraphConnection {
                id: edge.id(),
                source: edge.from_node(),
                source_handle: edge.from_port().to_owned(),
                target: edge.to_node(),
                target_handle: edge.to_port().to_owned(),
            })
            .collect();
        Self {
            nodes,
            edges,
            can_undo: !state.undo.is_empty(),
            can_redo: !state.redo.is_empty(),
        }
    }
}

#[derive(Deserialize)]
pub(crate) struct NodeMove {
    id: Uuid,
    position: NodePosition,
}

#[derive(Deserialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub(crate) enum GraphAction {
    SetLabel {
        node_id: Uuid,
        label: String,
    },
    SetEnabled {
        node_id: Uuid,
        enabled: bool,
    },
    Undo,
    Redo,
    CreateNode {
        type_id: String,
        position: NodePosition,
    },
    MoveNodes {
        nodes: Vec<NodeMove>,
    },
    SetValue {
        node_id: Uuid,
        port_id: String,
        value: Value,
    },
    DeleteElements {
        node_ids: Vec<Uuid>,
        edge_ids: Vec<Uuid>,
    },
    Connect {
        source: Uuid,
        source_handle: String,
        target: Uuid,
        target_handle: String,
    },
    Disconnect {
        edge_id: Uuid,
    },
}

fn validate_position(position: &NodePosition) -> Result<(), String> {
    if position.x.is_finite() && position.y.is_finite() {
        Ok(())
    } else {
        Err("Node coordinates must be finite numbers".to_owned())
    }
}

#[tauri::command]
pub(crate) fn get_graph(state: State<'_, GraphState>) -> Result<GraphSnapshot, String> {
    let graph = state
        .0
        .lock()
        .map_err(|_| "Graph state is unavailable".to_owned())?;
    Ok(GraphSnapshot::from(&*graph))
}

#[tauri::command]
pub(crate) fn apply_graph_action(
    action: GraphAction,
    state: State<'_, GraphState>,
) -> Result<GraphSnapshot, String> {
    let mut editor = state
        .0
        .lock()
        .map_err(|_| "Graph state is unavailable".to_owned())?;
    match action {
        GraphAction::Undo => {
            if let Some(previous) = editor.undo.pop_back() {
                let current = std::mem::replace(&mut editor.graph, previous);
                editor.redo.push(current);
            }
        }
        GraphAction::Redo => {
            if let Some(next) = editor.redo.pop() {
                let current = std::mem::replace(&mut editor.graph, next);
                editor.undo.push_back(current);
            }
        }
        action => {
            let previous = editor.graph.clone();
            if let Err(error) = apply_edit(&mut editor.graph, action) {
                editor.graph = previous;
                return Err(error);
            }
            if editor.graph != previous {
                editor.undo.push_back(previous);
                if editor.undo.len() > 100 {
                    editor.undo.pop_front();
                }
                editor.redo.clear();
            }
        }
    }
    Ok(GraphSnapshot::from(&*editor))
}

fn apply_edit(graph: &mut Graph, action: GraphAction) -> Result<(), String> {
    match action {
        GraphAction::SetLabel { node_id, label } => {
            let label = if label.trim().is_empty() {
                None
            } else {
                Some(label)
            };
            graph
                .set_node_label(node_id, label)
                .map_err(|error| error.to_string())?;
        }
        GraphAction::SetEnabled { node_id, enabled } => {
            graph
                .set_node_enabled(node_id, enabled)
                .map_err(|error| error.to_string())?;
        }
        GraphAction::Undo | GraphAction::Redo => return Err("Invalid graph edit".to_owned()),
        GraphAction::CreateNode { type_id, position } => {
            validate_position(&position)?;
            let node = catalog::create(&type_id, position).map_err(|error| error.to_string())?;
            graph.add_node(node).map_err(|error| error.to_string())?;
        }
        GraphAction::MoveNodes { nodes } => {
            for movement in &nodes {
                validate_position(&movement.position)?;
                if graph.get_node(movement.id).is_none() {
                    return Err(format!("Node {} does not exist", movement.id));
                }
            }
            for movement in nodes {
                graph
                    .set_node_position(movement.id, movement.position)
                    .map_err(|error| error.to_string())?;
            }
        }
        GraphAction::SetValue {
            node_id,
            port_id,
            value,
        } => {
            graph
                .set_node_value(node_id, &port_id, value)
                .map_err(|error| error.to_string())?;
        }
        GraphAction::DeleteElements { node_ids, edge_ids } => {
            for id in edge_ids {
                graph.disconnect(id);
            }
            for id in node_ids {
                graph.remove_node(id);
            }
        }
        GraphAction::Connect {
            source,
            source_handle,
            target,
            target_handle,
        } => {
            graph
                .connect_or_replace(source, &source_handle, target, &target_handle)
                .map_err(|error| error.to_string())?;
        }
        GraphAction::Disconnect { edge_id } => {
            graph.disconnect(edge_id);
        }
    }
    Ok(())
}
