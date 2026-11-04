use crate::non_empty_string::NonEmptyString;
use crate::connection::Connection;
use crate::{
    error::Error,
    node::{Node, NodePosition},
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct Graph {
    id: Uuid,
    name: NonEmptyString,
    nodes: HashMap<Uuid, Node>,
    connections: HashMap<Uuid, Connection>,
}

impl Graph {
    pub fn new(name: impl Into<String>) -> Result<Self, Error> {
        Ok(Self {
            id: Uuid::new_v4(),
            name: NonEmptyString::new(name, "graph name")?,
            nodes: HashMap::new(),
            connections: HashMap::new(),
        })
    }

    pub fn add_node(&mut self, node: Node) -> Result<(), Error> {
        if self.nodes.contains_key(&node.id()) {
            return Err(Error::DuplicateId(node.id().to_string()));
        }

        let node_id = node.id();
        let mut node = node;
        node.lock_ports();
        self.nodes.insert(node_id, node);
        Ok(())
    }

    pub fn name(&self) -> &str {
        self.name.as_str()
    }

    pub fn remove_node(&mut self, node_id: Uuid) -> Option<Node> {
        if !self.nodes.contains_key(&node_id) {
            return None;
        }

        self.connections.retain(|_, connection| {
            connection.from_node() != node_id && connection.to_node() != node_id
        });
        self.nodes.remove(&node_id)
    }

    pub fn get_node(&self, node_id: Uuid) -> Option<&Node> {
        self.nodes.get(&node_id)
    }

    pub fn set_node_position(
        &mut self,
        node_id: Uuid,
        position: NodePosition,
    ) -> Result<(), Error> {
        let node = self.nodes.get_mut(&node_id).ok_or(Error::NodeNotFound(node_id))?;
        node.set_position(position);
        Ok(())
    }

    pub fn count_nodes(&self) -> usize {
        self.nodes.len()
    }

    pub fn connect(
        &mut self,
        from_node: Uuid,
        from_port: &str,
        to_node: Uuid,
        to_port: &str,
    ) -> Result<Uuid, Error> {
        self.validate_connection(from_node, from_port, to_node, to_port)?;
        let connection = Connection::new(from_node, from_port, to_node, to_port);
        let connection_id = connection.id();
        self.connections.insert(connection_id, connection);
        Ok(connection_id)
    }

    fn validate_connection(
        &self,
        from_node: Uuid,
        from_port: &str,
        to_node: Uuid,
        to_port: &str,
    ) -> Result<(), Error> {
        let source_node = self.nodes.get(&from_node).ok_or(Error::NodeNotFound(from_node))?;
        let target_node = self.nodes.get(&to_node).ok_or(Error::NodeNotFound(to_node))?;
        let source_port = source_node
            .get_port(from_port)
            .ok_or_else(|| Error::PortNotFound {
                node_id: from_node,
                port_id: from_port.to_owned(),
            })?;
        let target_port = target_node
            .get_port(to_port)
            .ok_or_else(|| Error::PortNotFound {
                node_id: to_node,
                port_id: to_port.to_owned(),
            })?;

        if source_port.direction() != &crate::port::PortDirection::Output
            || target_port.direction() != &crate::port::PortDirection::Input
        {
            return Err(Error::InvalidPortDirection);
        }
        if source_port.kind() != target_port.kind() {
            return Err(Error::PortKindMismatch);
        }
        if source_port.kind() == &crate::port::PortKind::Data
            && source_port.data_type() != target_port.data_type()
        {
            return Err(Error::DataTypeMismatch);
        }
        if from_node == to_node {
            return Err(Error::SelfConnection);
        }
        if self.connections.values().any(|connection| {
            connection.from_node() == from_node
                && connection.from_port() == from_port
                && connection.to_node() == to_node
                && connection.to_port() == to_port
        }) {
            return Err(Error::DuplicateConnection);
        }
        if self.connections.values().any(|connection| {
            connection.to_node() == to_node && connection.to_port() == to_port
        }) {
            return Err(Error::InputPortAlreadyConnected);
        }
        if source_port.kind() == &crate::port::PortKind::Execution
            && self.connections.values().any(|connection| {
                connection.from_node() == from_node && connection.from_port() == from_port
            })
        {
            return Err(Error::ExecutionOutputAlreadyConnected);
        }

        Ok(())
    }

    pub fn disconnect(&mut self, connection_id: Uuid) -> Option<Connection> {
        self.connections.remove(&connection_id)
    }

    pub fn get_connection(&self, connection_id: Uuid) -> Option<&Connection> {
        self.connections.get(&connection_id)
    }

    pub fn connection_count(&self) -> usize {
        self.connections.len()
    }

    pub fn get_node_connections(&self, node_id: Uuid) -> impl Iterator<Item = &Connection> {
        self.connections.values().filter(move |connection| {
            connection.from_node() == node_id || connection.to_node() == node_id
        })
    }
}

impl<'de> Deserialize<'de> for Graph {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        #[derive(Deserialize)]
        struct GraphData {
            id: Uuid,
            name: NonEmptyString,
            nodes: HashMap<Uuid, Node>,
            connections: HashMap<Uuid, Connection>,
        }

        let GraphData {
            id,
            name,
            mut nodes,
            connections,
        } = GraphData::deserialize(deserializer)?;

        use serde::de::Error as _;

        for (node_id, node) in &mut nodes {
            if *node_id != node.id() {
                return Err(D::Error::custom("node key must match its ID"));
            }
            node.lock_ports();
        }

        let mut graph = Self {
            id,
            name,
            nodes,
            connections: HashMap::with_capacity(connections.len()),
        };

        for (connection_id, connection) in connections {
            if connection_id != connection.id() {
                return Err(D::Error::custom("connection key must match its ID"));
            }
            graph
                .validate_connection(
                    connection.from_node(),
                    connection.from_port(),
                    connection.to_node(),
                    connection.to_port(),
                )
                .map_err(D::Error::custom)?;
            graph.connections.insert(connection_id, connection);
        }

        Ok(graph)
    }
}
