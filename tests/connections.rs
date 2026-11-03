use pulse_core::{
    error::Error,
    graph::Graph,
    node::{Node, NodePosition},
    port::{DataType, Port, PortDirection, PortKind},
};
use serde_json::Value;
use uuid::Uuid;

fn position() -> NodePosition {
    NodePosition { x: 0.0, y: 0.0 }
}

fn port(id: &str, kind: PortKind, direction: PortDirection, data_type: Option<DataType>) -> Port {
    Port::new(id, kind, direction, data_type).unwrap()
}

fn node_with_ports(node_type: &str, ports: Vec<Port>) -> Node {
    let mut node = Node::new(node_type, position()).unwrap();
    for port in ports {
        node.add_port(port).unwrap();
    }
    node
}

fn data_output(id: &str, data_type: DataType) -> Port {
    port(id, PortKind::Data, PortDirection::Output, Some(data_type))
}

fn data_input(id: &str, data_type: DataType) -> Port {
    port(id, PortKind::Data, PortDirection::Input, Some(data_type))
}

fn execution_output(id: &str) -> Port {
    port(id, PortKind::Execution, PortDirection::Output, None)
}

fn execution_input(id: &str) -> Port {
    port(id, PortKind::Execution, PortDirection::Input, None)
}

fn graph_with_nodes(source: Node, target: Node) -> (Graph, Uuid, Uuid) {
    let source_id = source.id();
    let target_id = target.id();
    let mut graph = Graph::new("Connections").unwrap();
    graph.add_node(source).unwrap();
    graph.add_node(target).unwrap();
    (graph, source_id, target_id)
}

#[test]
fn creates_valid_execution_port() {
    let port = Port::new("execute", PortKind::Execution, PortDirection::Output, None).unwrap();

    assert_eq!(port.id(), "execute");
    assert_eq!(port.kind(), &PortKind::Execution);
    assert_eq!(port.direction(), &PortDirection::Output);
    assert_eq!(port.data_type(), None);
}

#[test]
fn creates_valid_data_port() {
    let port = Port::new(
        "value",
        PortKind::Data,
        PortDirection::Input,
        Some(DataType::Float),
    )
    .unwrap();

    assert_eq!(port.kind(), &PortKind::Data);
    assert_eq!(port.direction(), &PortDirection::Input);
    assert_eq!(port.data_type(), Some(&DataType::Float));
}

#[test]
fn rejects_empty_port_id() {
    assert!(matches!(
        Port::new("", PortKind::Execution, PortDirection::Input, None),
        Err(Error::Empty(field)) if field == "port ID"
    ));
}

#[test]
fn rejects_execution_port_with_data_type() {
    assert!(matches!(
        Port::new(
            "execute",
            PortKind::Execution,
            PortDirection::Output,
            Some(DataType::Bool)
        ),
        Err(Error::InvalidPortDataType)
    ));
}

#[test]
fn rejects_data_port_without_data_type() {
    assert!(matches!(
        Port::new("value", PortKind::Data, PortDirection::Input, None),
        Err(Error::InvalidPortDataType)
    ));
}

#[test]
fn port_json_round_trip_preserves_values() {
    let port = port(
        "value",
        PortKind::Data,
        PortDirection::Output,
        Some(DataType::String),
    );
    let json = serde_json::to_string(&port).unwrap();
    let restored: Port = serde_json::from_str(&json).unwrap();

    assert_eq!(serde_json::from_str::<Value>(&json).unwrap(), serde_json::to_value(restored).unwrap());
}

#[test]
fn node_adds_one_and_multiple_ports() {
    let mut node = Node::new("node", position()).unwrap();

    node.add_port(execution_input("start")).unwrap();
    node.add_port(data_input("value", DataType::Int)).unwrap();

    assert_eq!(node.port_count(), 2);
}

#[test]
fn node_rejects_duplicate_port_ids() {
    let mut node = Node::new("node", position()).unwrap();
    node.add_port(execution_input("port")).unwrap();

    assert!(matches!(
        node.add_port(execution_output("port")),
        Err(Error::DuplicateId(id)) if id == "port"
    ));
    assert_eq!(node.port_count(), 1);
}

#[test]
fn node_finds_existing_and_missing_ports() {
    let mut node = Node::new("node", position()).unwrap();
    node.add_port(execution_input("start")).unwrap();

    assert!(node.get_port("start").is_some());
    assert!(node.get_port("missing").is_none());
}

#[test]
fn node_counts_ports_correctly() {
    let mut node = Node::new("node", position()).unwrap();
    assert_eq!(node.port_count(), 0);
    node.add_port(execution_input("start")).unwrap();
    node.add_port(execution_output("finish")).unwrap();
    assert_eq!(node.port_count(), 2);
}

#[test]
fn connects_output_to_input() {
    let (mut graph, source_id, target_id) = graph_with_nodes(
        node_with_ports("source", vec![data_output("out", DataType::Float)]),
        node_with_ports("target", vec![data_input("in", DataType::Float)]),
    );

    let connection_id = graph.connect(source_id, "out", target_id, "in").unwrap();

    assert_eq!(graph.connection_count(), 1);
    assert_eq!(graph.get_connection(connection_id).unwrap().from_node(), source_id);
}

#[test]
fn rejects_input_to_output() {
    let (mut graph, source_id, target_id) = graph_with_nodes(
        node_with_ports("source", vec![data_input("in", DataType::Float)]),
        node_with_ports("target", vec![data_output("out", DataType::Float)]),
    );

    assert!(matches!(
        graph.connect(source_id, "in", target_id, "out"),
        Err(Error::InvalidPortDirection)
    ));
}

#[test]
fn rejects_execution_to_data() {
    let (mut graph, source_id, target_id) = graph_with_nodes(
        node_with_ports("source", vec![execution_output("out")]),
        node_with_ports("target", vec![data_input("in", DataType::Bool)]),
    );

    assert!(matches!(
        graph.connect(source_id, "out", target_id, "in"),
        Err(Error::PortKindMismatch)
    ));
}

#[test]
fn rejects_bool_to_int() {
    let (mut graph, source_id, target_id) = graph_with_nodes(
        node_with_ports("source", vec![data_output("out", DataType::Bool)]),
        node_with_ports("target", vec![data_input("in", DataType::Int)]),
    );

    assert!(matches!(
        graph.connect(source_id, "out", target_id, "in"),
        Err(Error::DataTypeMismatch)
    ));
}

#[test]
fn rejects_missing_node() {
    let mut graph = Graph::new("Connections").unwrap();
    let missing_id = Uuid::new_v4();

    assert!(matches!(
        graph.connect(missing_id, "out", Uuid::new_v4(), "in"),
        Err(Error::NodeNotFound(id)) if id == missing_id
    ));
    assert_eq!(graph.connection_count(), 0);
}

#[test]
fn rejects_missing_port() {
    let (mut graph, source_id, target_id) = graph_with_nodes(
        node_with_ports("source", vec![data_output("out", DataType::Float)]),
        node_with_ports("target", vec![data_input("in", DataType::Float)]),
    );

    assert!(matches!(
        graph.connect(source_id, "missing", target_id, "in"),
        Err(Error::PortNotFound { node_id, port_id })
            if node_id == source_id && port_id == "missing"
    ));
}

#[test]
fn rejects_identical_duplicate_connection() {
    let (mut graph, source_id, target_id) = graph_with_nodes(
        node_with_ports("source", vec![data_output("out", DataType::Float)]),
        node_with_ports("target", vec![data_input("in", DataType::Float)]),
    );
    graph.connect(source_id, "out", target_id, "in").unwrap();

    assert!(matches!(
        graph.connect(source_id, "out", target_id, "in"),
        Err(Error::DuplicateConnection)
    ));
}

#[test]
fn rejects_two_connections_to_one_input() {
    let source = node_with_ports("source", vec![data_output("out", DataType::Float)]);
    let other_source = node_with_ports("other", vec![data_output("out", DataType::Float)]);
    let target = node_with_ports("target", vec![data_input("in", DataType::Float)]);
    let source_id = source.id();
    let other_source_id = other_source.id();
    let target_id = target.id();
    let (mut graph, _, _) = graph_with_nodes(source, target);
    graph.add_node(other_source).unwrap();
    graph.connect(source_id, "out", target_id, "in").unwrap();

    assert!(matches!(
        graph.connect(other_source_id, "out", target_id, "in"),
        Err(Error::InputPortAlreadyConnected)
    ));
}

#[test]
fn data_output_can_connect_to_multiple_data_inputs() {
    let source = node_with_ports("source", vec![data_output("out", DataType::Float)]);
    let target = node_with_ports("target", vec![data_input("in", DataType::Float)]);
    let other_target = node_with_ports("other", vec![data_input("in", DataType::Float)]);
    let source_id = source.id();
    let target_id = target.id();
    let other_target_id = other_target.id();
    let (mut graph, _, _) = graph_with_nodes(source, target);
    graph.add_node(other_target).unwrap();

    graph.connect(source_id, "out", target_id, "in").unwrap();
    graph.connect(source_id, "out", other_target_id, "in").unwrap();

    assert_eq!(graph.connection_count(), 2);
}

#[test]
fn execution_output_can_connect_to_only_one_input() {
    let source = node_with_ports("source", vec![execution_output("out")]);
    let target = node_with_ports("target", vec![execution_input("in")]);
    let other_target = node_with_ports("other", vec![execution_input("in")]);
    let source_id = source.id();
    let target_id = target.id();
    let other_target_id = other_target.id();
    let (mut graph, _, _) = graph_with_nodes(source, target);
    graph.add_node(other_target).unwrap();
    graph.connect(source_id, "out", target_id, "in").unwrap();

    assert!(matches!(
        graph.connect(source_id, "out", other_target_id, "in"),
        Err(Error::ExecutionOutputAlreadyConnected)
    ));
}

#[test]
fn different_execution_outputs_of_one_node_work_independently() {
    let source = node_with_ports(
        "source",
        vec![execution_output("first"), execution_output("second")],
    );
    let target = node_with_ports("target", vec![execution_input("in")]);
    let other_target = node_with_ports("other", vec![execution_input("in")]);
    let source_id = source.id();
    let target_id = target.id();
    let other_target_id = other_target.id();
    let (mut graph, _, _) = graph_with_nodes(source, target);
    graph.add_node(other_target).unwrap();

    graph.connect(source_id, "first", target_id, "in").unwrap();
    graph
        .connect(source_id, "second", other_target_id, "in")
        .unwrap();

    assert_eq!(graph.connection_count(), 2);
}

#[test]
fn rejects_connection_from_node_to_itself() {
    let node = node_with_ports(
        "node",
        vec![data_output("out", DataType::Float), data_input("in", DataType::Float)],
    );
    let node_id = node.id();
    let mut graph = Graph::new("Connections").unwrap();
    graph.add_node(node).unwrap();

    assert!(matches!(
        graph.connect(node_id, "out", node_id, "in"),
        Err(Error::SelfConnection)
    ));
}

#[test]
fn disconnect_removes_connection_by_uuid() {
    let (mut graph, source_id, target_id) = graph_with_nodes(
        node_with_ports("source", vec![data_output("out", DataType::Float)]),
        node_with_ports("target", vec![data_input("in", DataType::Float)]),
    );
    let connection_id = graph.connect(source_id, "out", target_id, "in").unwrap();

    assert!(graph.disconnect(connection_id).is_some());
    assert!(graph.get_connection(connection_id).is_none());
    assert!(graph.disconnect(Uuid::new_v4()).is_none());
}

#[test]
fn removing_node_removes_related_connections() {
    let (mut graph, source_id, target_id) = graph_with_nodes(
        node_with_ports("source", vec![data_output("out", DataType::Float)]),
        node_with_ports("target", vec![data_input("in", DataType::Float)]),
    );
    let connection_id = graph.connect(source_id, "out", target_id, "in").unwrap();

    graph.remove_node(source_id).unwrap();

    assert_eq!(graph.connection_count(), 0);
    assert!(graph.get_connection(connection_id).is_none());
    assert_eq!(graph.get_node_connections(target_id).count(), 0);
}

#[test]
fn failed_connection_does_not_change_graph() {
    let (mut graph, source_id, target_id) = graph_with_nodes(
        node_with_ports("source", vec![data_output("out", DataType::Float)]),
        node_with_ports("target", vec![data_input("in", DataType::Int)]),
    );

    assert!(graph.connect(source_id, "out", target_id, "in").is_err());
    assert_eq!(graph.connection_count(), 0);
    assert_eq!(graph.get_node_connections(source_id).count(), 0);
    assert_eq!(graph.get_node_connections(target_id).count(), 0);
}

#[test]
fn graph_with_connections_round_trips_through_json() {
    let (mut graph, source_id, target_id) = graph_with_nodes(
        node_with_ports("source", vec![data_output("out", DataType::Float)]),
        node_with_ports("target", vec![data_input("in", DataType::Float)]),
    );
    let connection_id = graph.connect(source_id, "out", target_id, "in").unwrap();

    let json = serde_json::to_string(&graph).unwrap();
    let restored: Graph = serde_json::from_str(&json).unwrap();

    assert_eq!(restored.connection_count(), 1);
    let connection = restored.get_connection(connection_id).unwrap();
    assert_eq!(connection.from_node(), source_id);
    assert_eq!(connection.to_node(), target_id);
    assert_eq!(
        serde_json::from_str::<Value>(&json).unwrap(),
        serde_json::to_value(restored).unwrap()
    );
}
