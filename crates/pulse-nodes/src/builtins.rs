use crate::definition::{NodeCategory, NodeDefinition, PortDefinition};
use pulse_core::port::{DataType, PortDirection, PortKind};

pub(crate) fn definitions() -> impl Iterator<Item = NodeDefinition> {
    let factories: [fn() -> NodeDefinition; 4] = [
        // Flow
        start,
        branch,
        // Values
        bool_constant,
        int_constant,
    ];
    factories.into_iter().map(|factory| factory())
}

fn start() -> NodeDefinition {
    NodeDefinition {
        id: "flow.start",
        category: NodeCategory::Flow,
        display_name: "Start",
        ports: vec![execution_port("out", PortDirection::Output)],
    }
}

fn bool_constant() -> NodeDefinition {
    NodeDefinition {
        id: "value.bool",
        category: NodeCategory::Values,
        display_name: "Bool Constant",
        ports: vec![bool_port("value", PortDirection::Output)],
    }
}

fn int_constant() -> NodeDefinition {
    NodeDefinition {
        id: "value.int",
        display_name: "Int Constant",
        category: NodeCategory::Values,
        ports: vec![PortDefinition {
            id: "value",
            kind: PortKind::Data,
            direction: PortDirection::Output,
            data_type: Some(DataType::Int),
        }],
    }
}

fn branch() -> NodeDefinition {
    NodeDefinition {
        id: "flow.branch",
        category: NodeCategory::Flow,
        display_name: "Branch",
        ports: vec![
            execution_port("in", PortDirection::Input),
            bool_port("condition", PortDirection::Input),
            execution_port("true", PortDirection::Output),
            execution_port("false", PortDirection::Output),
        ],
    }
}

fn execution_port(id: &'static str, direction: PortDirection) -> PortDefinition {
    PortDefinition {
        id,
        kind: PortKind::Execution,
        direction,
        data_type: None,
    }
}

fn bool_port(id: &'static str, direction: PortDirection) -> PortDefinition {
    PortDefinition {
        id,
        kind: PortKind::Data,
        direction,
        data_type: Some(DataType::Bool),
    }
}
