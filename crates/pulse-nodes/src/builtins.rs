use crate::definition::{NodeDefinition, PortDefinition};
use pulse_core::port::{DataType, PortDirection, PortKind};

pub(crate) fn start() -> NodeDefinition {
    NodeDefinition {
        id: "flow.start",
        display_name: "Start",
        ports: vec![execution_port("out", PortDirection::Output)],
    }
}

pub(crate) fn bool_constant() -> NodeDefinition {
    NodeDefinition {
        id: "value.bool",
        display_name: "Bool Constant",
        ports: vec![bool_port("value", PortDirection::Output)],
    }
}

pub(crate) fn branch() -> NodeDefinition {
    NodeDefinition {
        id: "flow.branch",
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
