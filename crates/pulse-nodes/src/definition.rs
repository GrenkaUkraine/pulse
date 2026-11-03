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
    Values,
}

impl NodeCategory {
    pub fn id(self) -> &'static str {
        match self {
            Self::Flow => "flow",
            Self::Values => "values",
        }
    }

    pub fn display_name(self) -> &'static str {
        match self {
            Self::Flow => "Управление",
            Self::Values => "Значения",
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
