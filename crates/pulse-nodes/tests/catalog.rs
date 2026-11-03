use pulse_core::{graph::Graph, node::NodePosition};
use pulse_nodes::catalog::{self, CatalogError};

fn position() -> NodePosition {
    NodePosition { x: 0.0, y: 0.0 }
}

#[test]
fn lists_and_finds_builtin_nodes() {
    let ids: Vec<_> = catalog::definitions()
        .map(|definition| definition.id)
        .collect();
    assert_eq!(ids, ["flow.start", "value.bool", "flow.branch"]);
    for id in ids {
        assert_eq!(catalog::find(id).unwrap().id, id);
    }
    assert!(matches!(
        catalog::create("unknown", position()),
        Err(CatalogError::UnknownNodeType(id)) if id == "unknown"
    ));
}

#[test]
fn creates_distinct_instances_with_the_same_ports() {
    let first = catalog::create("flow.branch", position()).unwrap();
    let second = catalog::create("flow.branch", NodePosition { x: 10.0, y: 20.0 }).unwrap();
    assert_ne!(first.id(), second.id());
    assert_eq!(second.node_type(), "flow.branch");
    assert_eq!(second.position(), &NodePosition { x: 10.0, y: 20.0 });
    assert_eq!(first.port_count(), 4);
    assert_eq!(second.port_count(), 4);
    for id in ["in", "condition", "true", "false"] {
        let first_port = first.get_port(id).unwrap();
        let second_port = second.get_port(id).unwrap();
        assert_eq!(first_port.kind(), second_port.kind());
        assert_eq!(first_port.direction(), second_port.direction());
        assert_eq!(first_port.data_type(), second_port.data_type());
    }
}

#[test]
fn connects_builtin_nodes_in_a_graph() {
    let mut graph = Graph::new("Branch example").unwrap();
    let start = catalog::create("flow.start", position()).unwrap();
    let constant = catalog::create("value.bool", position()).unwrap();
    let branch = catalog::create("flow.branch", position()).unwrap();
    let (start_id, constant_id, branch_id) = (start.id(), constant.id(), branch.id());
    for node in [start, constant, branch] {
        graph.add_node(node).unwrap();
    }

    graph.connect(start_id, "out", branch_id, "in").unwrap();
    graph
        .connect(constant_id, "value", branch_id, "condition")
        .unwrap();
    assert_eq!(graph.connection_count(), 2);
}
