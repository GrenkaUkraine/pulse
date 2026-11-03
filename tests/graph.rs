use pulse_core::{
    error::Error,
    graph::Graph,
    node::{Node, NodePosition, NodeType},
};
use serde_json::Value;
use uuid::Uuid;

fn position(x: f32, y: f32) -> NodePosition {
    NodePosition { x, y }
}

#[test]
fn node_creation_generates_uuid_and_preserves_values() {
    let node = Node::new("input", position(10.0, 20.0)).unwrap();

    assert_ne!(node.id, Uuid::nil());
    assert_eq!(node.node_type.as_str(), "input");
    assert_eq!(node.position, position(10.0, 20.0));
}

#[test]
fn created_nodes_have_unique_uuids() {
    let first = Node::new("input", position(0.0, 0.0)).unwrap();
    let second = Node::new("output", position(1.0, 1.0)).unwrap();

    assert_ne!(first.id, second.id);
}

#[test]
fn invalid_node_type_is_rejected() {
    assert!(matches!(
        Node::new("", position(0.0, 0.0)),
        Err(Error::EmptyNodeType)
    ));
    assert!(matches!(
        Node::new(" \t\n", position(0.0, 0.0)),
        Err(Error::EmptyNodeType)
    ));
}

#[test]
fn set_position_changes_node_coordinates() {
    let mut node = Node::new("input", position(0.0, 0.0)).unwrap();

    node.set_position(position(5.0, -3.0));

    assert_eq!(node.position, position(5.0, -3.0));
}

#[test]
fn new_graph_contains_no_nodes() {
    let graph = Graph::new("Main graph").unwrap();

    assert_eq!(graph.count_nodes(), 0);
}

#[test]
fn adding_node_increases_node_count() {
    let mut graph = Graph::new("Main graph").unwrap();
    let node = Node::new("input", position(0.0, 0.0)).unwrap();

    graph.add_node(node).unwrap();

    assert_eq!(graph.count_nodes(), 1);
}

#[test]
fn duplicate_node_uuid_is_rejected_without_changing_graph() {
    let mut graph = Graph::new("Main graph").unwrap();
    let node = Node::new("input", position(0.0, 0.0)).unwrap();
    let node_id = node.id;
    let duplicate = Node {
        id: node_id,
        node_type: NodeType::new("output").unwrap(),
        position: position(10.0, 10.0),
    };

    graph.add_node(node).unwrap();
    assert!(matches!(
        graph.add_node(duplicate),
        Err(Error::DuplicateNodeId)
    ));
    assert_eq!(graph.count_nodes(), 1);
    assert_eq!(graph.get_node(node_id).unwrap().node_type.as_str(), "input");
}

#[test]
fn get_node_returns_requested_node() {
    let mut graph = Graph::new("Main graph").unwrap();
    let node = Node::new("input", position(1.0, 2.0)).unwrap();
    let node_id = node.id;
    graph.add_node(node).unwrap();

    let found = graph.get_node(node_id).unwrap();

    assert_eq!(found.id, node_id);
    assert_eq!(found.position, position(1.0, 2.0));
}

#[test]
fn get_node_mut_allows_changing_position() {
    let mut graph = Graph::new("Main graph").unwrap();
    let node = Node::new("input", position(0.0, 0.0)).unwrap();
    let node_id = node.id;
    graph.add_node(node).unwrap();

    graph
        .get_node_mut(node_id)
        .unwrap()
        .set_position(position(8.0, 13.0));

    assert_eq!(
        graph.get_node(node_id).unwrap().position,
        position(8.0, 13.0)
    );
}

#[test]
fn remove_node_deletes_requested_node() {
    let mut graph = Graph::new("Main graph").unwrap();
    let node = Node::new("input", position(0.0, 0.0)).unwrap();
    let node_id = node.id;
    graph.add_node(node).unwrap();

    assert!(graph.remove_node(node_id).is_some());
    assert_eq!(graph.count_nodes(), 0);
    assert!(graph.get_node(node_id).is_none());
}

#[test]
fn missing_uuid_returns_none_for_search_and_removal() {
    let mut graph = Graph::new("Main graph").unwrap();
    let missing_id = Uuid::new_v4();

    assert!(graph.get_node(missing_id).is_none());
    assert!(graph.remove_node(missing_id).is_none());
}

#[test]
fn graph_json_round_trip_preserves_nodes() {
    let mut graph = Graph::new("Main graph").unwrap();
    let node = Node::new("input", position(3.5, -2.0)).unwrap();
    let node_id = node.id;
    graph.add_node(node).unwrap();

    let json = serde_json::to_string(&graph).unwrap();
    let restored: Graph = serde_json::from_str(&json).unwrap();

    assert_eq!(restored.name(), "Main graph");
    assert_eq!(restored.count_nodes(), 1);
    let restored_node = restored.get_node(node_id).unwrap();
    assert_eq!(restored_node.id, node_id);
    assert_eq!(restored_node.node_type.as_str(), "input");
    assert_eq!(restored_node.position, position(3.5, -2.0));

    let original_json: Value = serde_json::from_str(&json).unwrap();
    let restored_json = serde_json::to_value(restored).unwrap();
    assert_eq!(original_json, restored_json);
}
