use pulse_core::{
    error::Error,
    graph::Graph,
    node::{Node, NodePosition},
    port::{DataType, Port, PortDirection, PortKind},
};
use serde_json::Value;
use uuid::Uuid;

fn position(x: f32, y: f32) -> NodePosition {
    NodePosition { x, y }
}

#[test]
fn node_creation_generates_uuid_and_preserves_values() {
    let node = Node::new("input", position(10.0, 20.0)).unwrap();

    assert_ne!(node.id(), Uuid::nil());
    assert_eq!(node.node_type(), "input");
    assert_eq!(node.position(), &position(10.0, 20.0));
}

#[test]
fn created_nodes_have_unique_uuids() {
    let first = Node::new("input", position(0.0, 0.0)).unwrap();
    let second = Node::new("output", position(1.0, 1.0)).unwrap();

    assert_ne!(first.id(), second.id());
}

#[test]
fn invalid_node_type_is_rejected() {
    assert!(matches!(
        Node::new("", position(0.0, 0.0)),
        Err(Error::Empty(field)) if field == "node type"
    ));
    assert!(matches!(
        Node::new(" \t\n", position(0.0, 0.0)),
        Err(Error::Empty(field)) if field == "node type"
    ));
}

#[test]
fn set_position_changes_node_coordinates() {
    let mut node = Node::new("input", position(0.0, 0.0)).unwrap();

    node.set_position(position(5.0, -3.0));

    assert_eq!(node.position(), &position(5.0, -3.0));
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
    let node_id = node.id();
    let mut duplicate_json = serde_json::to_value(&node).unwrap();
    duplicate_json["node_type"] = Value::String("output".to_owned());
    duplicate_json["position"] = serde_json::json!({ "x": 10.0, "y": 10.0 });
    let duplicate: Node = serde_json::from_value(duplicate_json).unwrap();

    graph.add_node(node).unwrap();
    assert!(matches!(
        graph.add_node(duplicate),
        Err(Error::DuplicateId(id)) if id == node_id.to_string()
    ));
    assert_eq!(graph.count_nodes(), 1);
    assert_eq!(graph.get_node(node_id).unwrap().node_type(), "input");
}

#[test]
fn get_node_returns_requested_node() {
    let mut graph = Graph::new("Main graph").unwrap();
    let node = Node::new("input", position(1.0, 2.0)).unwrap();
    let node_id = node.id();
    graph.add_node(node).unwrap();

    let found = graph.get_node(node_id).unwrap();

    assert_eq!(found.id(), node_id);
    assert_eq!(found.position(), &position(1.0, 2.0));
}

#[test]
fn get_node_mut_allows_changing_position() {
    let mut graph = Graph::new("Main graph").unwrap();
    let node = Node::new("input", position(0.0, 0.0)).unwrap();
    let node_id = node.id();
    graph.add_node(node).unwrap();

    graph
        .get_node_mut(node_id)
        .unwrap()
        .set_position(position(8.0, 13.0));

    assert_eq!(
        graph.get_node(node_id).unwrap().position(),
        &position(8.0, 13.0)
    );
}

#[test]
fn remove_node_deletes_requested_node() {
    let mut graph = Graph::new("Main graph").unwrap();
    let node = Node::new("input", position(0.0, 0.0)).unwrap();
    let node_id = node.id();
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
    let node_id = node.id();
    graph.add_node(node).unwrap();

    let json = serde_json::to_string(&graph).unwrap();
    let restored: Graph = serde_json::from_str(&json).unwrap();

    assert_eq!(restored.name(), "Main graph");
    assert_eq!(restored.count_nodes(), 1);
    let restored_node = restored.get_node(node_id).unwrap();
    assert_eq!(restored_node.id(), node_id);
    assert_eq!(restored_node.node_type(), "input");
    assert_eq!(restored_node.position(), &position(3.5, -2.0));

    let original_json: Value = serde_json::from_str(&json).unwrap();
    let restored_json = serde_json::to_value(restored).unwrap();
    assert_eq!(original_json, restored_json);
}

#[test]
fn duplicate_port_id_is_rejected_without_changing_node() {
    let mut node = Node::new("input", position(0.0, 0.0)).unwrap();
    let first = Port::new(
        "value",
        PortKind::Data,
        PortDirection::Input,
        Some(DataType::Float),
    )
    .unwrap();
    let duplicate = Port::new(
        "value",
        PortKind::Data,
        PortDirection::Output,
        Some(DataType::Float),
    )
    .unwrap();

    node.add_port(first).unwrap();
    assert!(matches!(
        node.add_port(duplicate),
        Err(Error::DuplicateId(id)) if id == "value"
    ));
    assert_eq!(node.port_count(), 1);
}

#[test]
fn nodes_can_have_same_port_id() {
    let mut first = Node::new("input", position(0.0, 0.0)).unwrap();
    let mut second = Node::new("output", position(1.0, 1.0)).unwrap();
    let first_port = Port::new(
        "value",
        PortKind::Data,
        PortDirection::Input,
        Some(DataType::Float),
    )
    .unwrap();
    let second_port = Port::new(
        "value",
        PortKind::Data,
        PortDirection::Output,
        Some(DataType::Float),
    )
    .unwrap();

    first.add_port(first_port).unwrap();
    second.add_port(second_port).unwrap();

    assert_eq!(first.port_count(), 1);
    assert_eq!(second.port_count(), 1);
}

#[test]
fn ports_cannot_be_changed_after_node_is_added_to_graph() {
    let mut graph = Graph::new("Main graph").unwrap();
    let node = Node::new("input", position(0.0, 0.0)).unwrap();
    let node_id = node.id();
    graph.add_node(node).unwrap();

    let port = Port::new(
        "value",
        PortKind::Data,
        PortDirection::Input,
        Some(DataType::Float),
    )
    .unwrap();
    let result = graph.get_node_mut(node_id).unwrap().add_port(port);

    assert!(matches!(result, Err(Error::PortsLocked)));
    assert_eq!(graph.get_node(node_id).unwrap().port_count(), 0);
}

fn node_with_port(
    node_type: &str,
    port_id: &str,
    kind: PortKind,
    direction: PortDirection,
    data_type: Option<DataType>,
) -> Node {
    let mut node = Node::new(node_type, position(0.0, 0.0)).unwrap();
    node.add_port(Port::new(port_id, kind, direction, data_type).unwrap())
        .unwrap();
    node
}

#[test]
fn connect_creates_connection_and_can_be_queried() {
    let mut graph = Graph::new("Main graph").unwrap();
    let source = node_with_port(
        "source",
        "out",
        PortKind::Data,
        PortDirection::Output,
        Some(DataType::Float),
    );
    let target = node_with_port(
        "target",
        "in",
        PortKind::Data,
        PortDirection::Input,
        Some(DataType::Float),
    );
    let source_id = source.id();
    let target_id = target.id();
    graph.add_node(source).unwrap();
    graph.add_node(target).unwrap();

    let connection_id = graph
        .connect(source_id, "out", target_id, "in")
        .unwrap();
    let connection = graph.get_connection(connection_id).unwrap();

    assert_eq!(graph.connection_count(), 1);
    assert_eq!(connection.from_node(), source_id);
    assert_eq!(connection.from_port(), "out");
    assert_eq!(connection.to_node(), target_id);
    assert_eq!(connection.to_port(), "in");
}

#[test]
fn connect_rejects_missing_nodes_and_ports_without_mutation() {
    let mut graph = Graph::new("Main graph").unwrap();
    let source = node_with_port(
        "source",
        "out",
        PortKind::Data,
        PortDirection::Output,
        Some(DataType::Float),
    );
    let source_id = source.id();
    let missing_id = Uuid::new_v4();
    graph.add_node(source).unwrap();

    assert!(matches!(
        graph.connect(missing_id, "out", source_id, "out"),
        Err(Error::NodeNotFound(id)) if id == missing_id
    ));
    assert!(matches!(
        graph.connect(source_id, "missing", source_id, "out"),
        Err(Error::PortNotFound { node_id, port_id })
            if node_id == source_id && port_id == "missing"
    ));
    assert_eq!(graph.connection_count(), 0);
}

#[test]
fn connect_rejects_invalid_direction_kind_and_data_type() {
    let mut graph = Graph::new("Main graph").unwrap();
    let source = node_with_port(
        "source",
        "out",
        PortKind::Data,
        PortDirection::Input,
        Some(DataType::Float),
    );
    let target = node_with_port(
        "target",
        "in",
        PortKind::Execution,
        PortDirection::Output,
        None,
    );
    let source_id = source.id();
    let target_id = target.id();
    graph.add_node(source).unwrap();
    graph.add_node(target).unwrap();

    assert!(matches!(
        graph.connect(source_id, "out", target_id, "in"),
        Err(Error::InvalidPortDirection)
    ));
    assert_eq!(graph.connection_count(), 0);

    let mut graph = Graph::new("Main graph").unwrap();
    let source = node_with_port(
        "source",
        "out",
        PortKind::Data,
        PortDirection::Output,
        Some(DataType::Float),
    );
    let target = node_with_port(
        "target",
        "in",
        PortKind::Execution,
        PortDirection::Input,
        None,
    );
    let source_id = source.id();
    let target_id = target.id();
    graph.add_node(source).unwrap();
    graph.add_node(target).unwrap();
    assert!(matches!(
        graph.connect(source_id, "out", target_id, "in"),
        Err(Error::PortKindMismatch)
    ));

    let mut graph = Graph::new("Main graph").unwrap();
    let source = node_with_port(
        "source",
        "out",
        PortKind::Data,
        PortDirection::Output,
        Some(DataType::Float),
    );
    let target = node_with_port(
        "target",
        "in",
        PortKind::Data,
        PortDirection::Input,
        Some(DataType::Int),
    );
    let source_id = source.id();
    let target_id = target.id();
    graph.add_node(source).unwrap();
    graph.add_node(target).unwrap();
    assert!(matches!(
        graph.connect(source_id, "out", target_id, "in"),
        Err(Error::DataTypeMismatch)
    ));
    assert_eq!(graph.connection_count(), 0);
}

#[test]
fn connect_rejects_self_duplicate_and_occupied_ports() {
    let mut graph = Graph::new("Main graph").unwrap();
    let node = node_with_port(
        "node",
        "out",
        PortKind::Execution,
        PortDirection::Output,
        None,
    );
    let node_id = node.id();
    graph.add_node(node).unwrap();
    assert!(matches!(
        graph.connect(node_id, "out", node_id, "out"),
        Err(Error::InvalidPortDirection)
    ));

    let mut graph = Graph::new("Main graph").unwrap();
    let source = node_with_port(
        "source",
        "out",
        PortKind::Data,
        PortDirection::Output,
        Some(DataType::Float),
    );
    let target = node_with_port(
        "target",
        "in",
        PortKind::Data,
        PortDirection::Input,
        Some(DataType::Float),
    );
    let source_id = source.id();
    let target_id = target.id();
    graph.add_node(source).unwrap();
    graph.add_node(target).unwrap();
    let connection_id = graph
        .connect(source_id, "out", target_id, "in")
        .unwrap();
    assert!(matches!(
        graph.connect(source_id, "out", target_id, "in"),
        Err(Error::DuplicateConnection)
    ));
    assert_eq!(graph.connection_count(), 1);

    let other_source = node_with_port(
        "other",
        "out",
        PortKind::Data,
        PortDirection::Output,
        Some(DataType::Float),
    );
    let other_source_id = other_source.id();
    graph.add_node(other_source).unwrap();
    assert!(matches!(
        graph.connect(other_source_id, "out", target_id, "in"),
        Err(Error::InputPortAlreadyConnected)
    ));

    let execution_target = node_with_port(
        "execution-target",
        "in",
        PortKind::Execution,
        PortDirection::Input,
        None,
    );
    let execution_target_id = execution_target.id();
    graph.add_node(execution_target).unwrap();
    let execution_source = node_with_port(
        "execution-source",
        "out",
        PortKind::Execution,
        PortDirection::Output,
        None,
    );
    let execution_source_id = execution_source.id();
    graph.add_node(execution_source).unwrap();
    graph
        .connect(
            execution_source_id,
            "out",
            execution_target_id,
            "in",
        )
        .unwrap();
    let another_target = node_with_port(
        "another-target",
        "in",
        PortKind::Execution,
        PortDirection::Input,
        None,
    );
    let another_target_id = another_target.id();
    graph.add_node(another_target).unwrap();
    assert!(matches!(
        graph.connect(
            execution_source_id,
            "out",
            another_target_id,
            "in"
        ),
        Err(Error::ExecutionOutputAlreadyConnected)
    ));
    assert_eq!(graph.get_connection(connection_id).unwrap().id(), connection_id);
}

#[test]
fn disconnect_and_remove_node_clean_up_connections() {
    let mut graph = Graph::new("Main graph").unwrap();
    let source = node_with_port(
        "source",
        "out",
        PortKind::Data,
        PortDirection::Output,
        Some(DataType::Float),
    );
    let target = node_with_port(
        "target",
        "in",
        PortKind::Data,
        PortDirection::Input,
        Some(DataType::Float),
    );
    let source_id = source.id();
    let target_id = target.id();
    graph.add_node(source).unwrap();
    graph.add_node(target).unwrap();
    let connection_id = graph
        .connect(source_id, "out", target_id, "in")
        .unwrap();
    assert_eq!(graph.get_node_connections(source_id).count(), 1);
    assert_eq!(graph.get_node_connections(target_id).count(), 1);

    assert!(graph.disconnect(Uuid::new_v4()).is_none());
    assert!(graph.disconnect(connection_id).is_some());
    assert_eq!(graph.connection_count(), 0);

    let connection_id = graph
        .connect(source_id, "out", target_id, "in")
        .unwrap();
    assert!(graph.remove_node(source_id).is_some());
    assert_eq!(graph.connection_count(), 0);
    assert!(graph.get_connection(connection_id).is_none());
    assert!(graph.get_node(source_id).is_none());
    assert!(graph.remove_node(source_id).is_none());
}
