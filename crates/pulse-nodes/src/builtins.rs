use crate::definition::{
    ControlKind, DefaultValue, NodeCategory, NodeDefinition, NodeKind, PortDefinition,
};
use pulse_core::port::{DataType, PortDirection, PortKind};

pub(crate) fn definitions() -> impl Iterator<Item = NodeDefinition> {
    [
        NodeDefinition {
            id: "flow.setup",
            kind: NodeKind::Event,
            display_name: "On Setup",
            description: "Run once when the board starts.",
            category: NodeCategory::Flow,
            ports: vec![exec_output("exec")],
        },
        NodeDefinition {
            id: "flow.loop",
            kind: NodeKind::Event,
            display_name: "On Loop",
            description: "Repeat this execution chain continuously.",
            category: NodeCategory::Flow,
            ports: vec![exec_output("exec")],
        },
        NodeDefinition {
            id: "flow.branch",
            kind: NodeKind::Flow,
            display_name: "Branch",
            description: "Choose an execution path based on a boolean condition.",
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
            kind: NodeKind::Action,
            display_name: "Delay",
            description: "Pause execution for the specified number of milliseconds.",
            category: NodeCategory::Flow,
            ports: vec![
                exec_input("exec_in"),
                exec_output("exec_out"),
                int_input("duration_ms", Some(1000)),
            ],
        },
        NodeDefinition {
            id: "gpio.digital_write",
            kind: NodeKind::Action,
            display_name: "Digital Write",
            description: "Set a digital pin to HIGH or LOW.",
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
            kind: NodeKind::Action,
            display_name: "Digital Read",
            description: "Read the current digital level of a pin.",
            category: NodeCategory::Gpio,
            ports: vec![int_input("pin", None), bool_output("value", None)],
        },
        NodeDefinition {
            id: "value.bool",
            kind: NodeKind::Value,
            display_name: "Boolean",
            description: "Provide a constant true or false value.",
            category: NodeCategory::Values,
            ports: vec![bool_output("value", Some(false))],
        },
        NodeDefinition {
            id: "value.int",
            kind: NodeKind::Value,
            display_name: "Integer",
            description: "Provide a constant whole number.",
            category: NodeCategory::Values,
            ports: vec![int_output("value", Some(0))],
        },
        NodeDefinition {
            id: "logic.not",
            kind: NodeKind::Logic,
            display_name: "NOT",
            description: "Invert a boolean value.",
            category: NodeCategory::Logic,
            ports: vec![bool_input("input", None), bool_output("result", None)],
        },
        NodeDefinition {
            id: "logic.equal_int",
            kind: NodeKind::Logic,
            display_name: "Equal (Integer)",
            description: "Check whether two integers are equal.",
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
        title: port_title(id),
        control: None,
        show_control: false,
        max_connections: Some(1),
        kind: PortKind::Execution,
        direction: PortDirection::Output,
        data_type: None,
        default_value: None,
    }
}

fn exec_input(id: &'static str) -> PortDefinition {
    PortDefinition {
        id,
        title: port_title(id),
        control: None,
        show_control: false,
        max_connections: Some(1),
        kind: PortKind::Execution,
        direction: PortDirection::Input,
        data_type: None,
        default_value: None,
    }
}

fn bool_input(id: &'static str, default_value: Option<bool>) -> PortDefinition {
    PortDefinition {
        id,
        title: port_title(id),
        control: Some(ControlKind::Checkbox),
        show_control: true,
        max_connections: Some(1),
        kind: PortKind::Data,
        direction: PortDirection::Input,
        data_type: Some(DataType::Bool),
        default_value: default_value.map(DefaultValue::Bool),
    }
}

fn bool_output(id: &'static str, default_value: Option<bool>) -> PortDefinition {
    PortDefinition {
        id,
        title: port_title(id),
        control: Some(ControlKind::Checkbox),
        show_control: default_value.is_some(),
        max_connections: None,
        kind: PortKind::Data,
        direction: PortDirection::Output,
        data_type: Some(DataType::Bool),
        default_value: default_value.map(DefaultValue::Bool),
    }
}

fn int_input(id: &'static str, default_value: Option<i64>) -> PortDefinition {
    PortDefinition {
        id,
        title: port_title(id),
        control: if id == "pin" {
            Some(ControlKind::Pin)
        } else {
            Some(ControlKind::Integer)
        },
        show_control: true,
        max_connections: Some(1),
        kind: PortKind::Data,
        direction: PortDirection::Input,
        data_type: Some(DataType::Int),
        default_value: default_value.map(DefaultValue::Int),
    }
}

fn int_output(id: &'static str, default_value: Option<i64>) -> PortDefinition {
    PortDefinition {
        id,
        title: port_title(id),
        control: if id == "pin" {
            Some(ControlKind::Pin)
        } else {
            Some(ControlKind::Integer)
        },
        show_control: default_value.is_some(),
        max_connections: None,
        kind: PortKind::Data,
        direction: PortDirection::Output,
        data_type: Some(DataType::Int),
        default_value: default_value.map(DefaultValue::Int),
    }
}

fn port_title(id: &str) -> Option<&'static str> {
    match id {
        "exec" | "exec_in" | "exec_out" => None,
        "condition" => Some("Condition"),
        "duration_ms" => Some("Duration (ms)"),
        "pin" => Some("Pin"),
        "value" => Some("Value"),
        "input" => Some("Input"),
        "result" => Some("Result"),
        "a" => Some("A"),
        "b" => Some("B"),
        "true" => Some("True"),
        "false" => Some("False"),
        _ => None,
    }
}
