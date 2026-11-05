use pulse_core::{
    error::Error,
    node::{Node, NodePosition},
    port::{DataType, Port, PortDirection, PortKind},
};
use serde::Serialize;

pub use pulse_core::value::Value as DefaultValue;

#[derive(Clone, Copy, Debug, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum NodeKind {
    Event,
    Action,
    Flow,
    Value,
    Logic,
}

#[derive(Clone, Copy, Debug, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ControlKind {
    Checkbox,
    Integer,
    Decimal,
    Text,
    Pin,
}

#[derive(Debug, Serialize)]
pub struct PortDefinition {
    pub id: &'static str,
    pub title: Option<&'static str>,
    pub kind: PortKind,
    pub direction: PortDirection,
    pub data_type: Option<DataType>,
    pub default_value: Option<DefaultValue>,
    pub control: Option<ControlKind>,
    pub show_control: bool,
    pub max_connections: Option<usize>,
}

#[derive(Debug, Serialize)]
pub struct NodeDefinition {
    pub category: NodeCategory,
    pub kind: NodeKind,
    pub id: &'static str,
    pub display_name: &'static str,
    pub description: &'static str,
    pub icon: &'static str,
    pub ports: Vec<PortDefinition>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize)]
pub enum NodeCategory {
    Flow,
    Gpio,
    Values,
    Logic,
}

impl NodeCategory {
    pub fn id(self) -> &'static str {
        match self {
            Self::Flow => "flow",
            Self::Gpio => "gpio",
            Self::Values => "values",
            Self::Logic => "logic",
        }
    }
    pub fn display_name(self) -> &'static str {
        match self {
            Self::Flow => "Flow",
            Self::Gpio => "GPIO",
            Self::Values => "Values",
            Self::Logic => "Logic",
        }
    }
}

impl NodeDefinition {
    pub fn instantiate(self, position: NodePosition) -> Result<Node, Error> {
        let mut node = Node::new(self.id, position)?;
        for definition in self.ports {
            let port = Port::new(
                definition.id,
                definition.kind,
                definition.direction,
                definition.data_type,
            )?
            .with_connection_limit(definition.max_connections);
            node.add_port(port)?;
            if let Some(value) = definition.default_value {
                node.set_value(definition.id, value)?;
            }
        }
        Ok(node)
    }
}
