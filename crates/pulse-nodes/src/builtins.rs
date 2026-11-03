use crate::definition::{DefaultValue, NodeCategory, NodeDefinition, PortDefinition};
use pulse_core::port::{DataType, PortDirection, PortKind};

pub(crate) fn definitions() -> impl Iterator<Item = NodeDefinition> {
    [
        NodeDefinition {
            id: "flow.setup",
            display_name: "On Setup",
            category: NodeCategory::Flow,
            ports: vec![exec_output("exec")],
        },
        NodeDefinition {
            id: "flow.loop",
            display_name: "On Loop",
            category: NodeCategory::Flow,
            ports: vec![exec_output("exec")],
        },
        NodeDefinition {
            id: "flow.branch",
            display_name: "Branch",
            category: NodeCategory::Flow,
            ports: vec![
                exec_input("exec_in"),
                bool_input("condition", Some(false)),
                exec_output("true"),
                exec_output("false"),
            ],
        },
        NodeDefinition {
            id: "flow.delay",
            display_name: "Delay",
            category: NodeCategory::Flow,
            ports: vec![
                exec_input("exec_in"),
                exec_output("exec_out"),
                int_input("duration_ms", Some(1000)),
            ],
        },
        NodeDefinition {
            id: "gpio.digital_write",
            display_name: "Digital Write",
            category: NodeCategory::Gpio,
            ports: vec![
                exec_input("exec_in"),
                exec_output("exec_out"),
                int_input("pin", None),
                bool_input("value", Some(false)),
            ],
        },
        NodeDefinition {
            id: "gpio.digital_read",
            display_name: "Digital Read",
            category: NodeCategory::Gpio,
            ports: vec![int_input("pin", None), bool_output("value", None)],
        },
        NodeDefinition {
            id: "value.bool",
            display_name: "Boolean",
            category: NodeCategory::Values,
            ports: vec![bool_output("value", Some(false))],
        },
        NodeDefinition {
            id: "value.int",
            display_name: "Integer",
            category: NodeCategory::Values,
            ports: vec![int_output("value", Some(0))],
        },
        NodeDefinition {
            id: "logic.not",
            display_name: "NOT",
            category: NodeCategory::Logic,
            ports: vec![bool_input("input", None), bool_output("result", None)],
        },
        NodeDefinition {
            id: "logic.equal_int",
            display_name: "Equal (Integer)",
            category: NodeCategory::Logic,
            ports: vec![
                int_input("a", None),
                int_input("b", None),
                bool_output("result", None),
            ],
        },
    ]
    .into_iter()
}

fn exec_output(id: &'static str) -> PortDefinition {
    PortDefinition {
        id,
        kind: PortKind::Execution,
        direction: PortDirection::Output,
        data_type: None,
        default_value: None,
    }
}

fn exec_input(id: &'static str) -> PortDefinition {
    PortDefinition {
        id,
        kind: PortKind::Execution,
        direction: PortDirection::Input,
        data_type: None,
        default_value: None,
    }
}

fn bool_input(id: &'static str, default_value: Option<bool>) -> PortDefinition {
    PortDefinition {
        id,
        kind: PortKind::Data,
        direction: PortDirection::Input,
        data_type: Some(DataType::Bool),
        default_value: default_value.map(DefaultValue::Bool),
    }
}

fn bool_output(id: &'static str, default_value: Option<bool>) -> PortDefinition {
    PortDefinition {
        id,
        kind: PortKind::Data,
        direction: PortDirection::Output,
        data_type: Some(DataType::Bool),
        default_value: default_value.map(DefaultValue::Bool),
    }
}

fn int_input(id: &'static str, default_value: Option<i64>) -> PortDefinition {
    PortDefinition {
        id,
        kind: PortKind::Data,
        direction: PortDirection::Input,
        data_type: Some(DataType::Int),
        default_value: default_value.map(DefaultValue::Int),
    }
}

fn int_output(id: &'static str, default_value: Option<i64>) -> PortDefinition {
    PortDefinition {
        id,
        kind: PortKind::Data,
        direction: PortDirection::Output,
        data_type: Some(DataType::Int),
        default_value: default_value.map(DefaultValue::Int),
    }
}
