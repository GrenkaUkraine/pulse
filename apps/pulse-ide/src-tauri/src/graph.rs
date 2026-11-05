use pulse_core::{graph::Graph, node::NodePosition, value::Value};
use pulse_nodes::catalog;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Mutex};
use tauri::State;
use uuid::Uuid;

pub(crate) struct GraphState(Mutex<Graph>);

impl Default for GraphState {
    fn default() -> Self {
        Self(Mutex::new(
            Graph::new("Untitled").expect("valid graph name"),
        ))
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct NodeInstance {
    id: Uuid,
    type_id: String,
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
pub(crate) struct GraphSnapshot {
    nodes: Vec<NodeInstance>,
    edges: Vec<GraphConnection>,
}

impl From<&Graph> for GraphSnapshot {
    fn from(graph: &Graph) -> Self {
        let mut nodes: Vec<_> = graph
            .nodes()
            .map(|node| NodeInstance {
                id: node.id(),
                type_id: node.node_type().to_owned(),
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
        Self { nodes, edges }
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
    let mut graph = state
        .0
        .lock()
        .map_err(|_| "Graph state is unavailable".to_owned())?;
    match action {
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
    Ok(GraphSnapshot::from(&*graph))
}
