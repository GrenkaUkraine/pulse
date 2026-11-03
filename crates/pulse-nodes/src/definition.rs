use pulse_core::{
    error::Error,
    node::{Node, NodePosition},
    port::{DataType, Port, PortDirection, PortKind},
};

#[derive(Debug)]
pub struct PortDefinition {
    pub id: &'static str,
    pub kind: PortKind,
    pub direction: PortDirection,
    pub data_type: Option<DataType>,
    pub default_value: Option<DefaultValue>,
}

#[derive(Debug)]
pub struct NodeDefinition {
    pub category: NodeCategory,
    pub id: &'static str,
    pub display_name: &'static str,
    pub ports: Vec<PortDefinition>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
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
            Self::Values => "values",
            Self::Gpio => "gpio",
            Self::Logic => "logic",
        }
    }

    pub fn display_name(self) -> &'static str {
        match self {
            Self::Flow => "Flow",
            Self::Values => "Values",
            Self::Gpio => "GPIO",
            Self::Logic => "Logic",
        }
    }
}

impl NodeDefinition {
    pub fn instantiate(self, position: NodePosition) -> Result<Node, Error> {
        let mut node = Node::new(self.id, position)?;
        for port in self.ports {
            node.add_port(Port::new(
                port.id,
                port.kind,
                port.direction,
                port.data_type,
            )?)?;
        }
        Ok(node)
    }
}

/// Initial value for a data input or a constant node parameter.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DefaultValue {
    Bool(bool),
    Int(i64),
}
