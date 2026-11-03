use crate::{
    error::{validate_non_empty, Error},
    node::Node,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct Graph {
    id: Uuid,
    name: GraphName,
    nodes: HashMap<Uuid, Node>,
}

impl Graph {
    pub fn new(name: impl Into<String>) -> Result<Self, Error> {
        Ok(Self {
            id: Uuid::new_v4(),
            name: GraphName::new(name)?,
            nodes: HashMap::new(),
        })
    }

    pub fn add_node(&mut self, node: Node) -> Result<(), Error> {
        if self.nodes.contains_key(&node.id()) {
            return Err(Error::DuplicateNodeId);
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
        self.nodes.remove(&node_id)
    }

    pub fn get_node(&self, node_id: Uuid) -> Option<&Node> {
        self.nodes.get(&node_id)
    }

    pub fn get_node_mut(&mut self, node_id: Uuid) -> Option<&mut Node> {
        self.nodes.get_mut(&node_id)
    }

    pub fn count_nodes(&self) -> usize {
        self.nodes.len()
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
            name: GraphName,
            nodes: HashMap<Uuid, Node>,
        }

        let GraphData {
            id,
            name,
            mut nodes,
        } = GraphData::deserialize(deserializer)?;

        for node in nodes.values_mut() {
            node.lock_ports();
        }

        Ok(Self { id, name, nodes })
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct GraphName(String);

impl GraphName {
    pub fn new(value: impl Into<String>) -> Result<Self, Error> {
        validate_non_empty(value.into(), Error::EmptyGraphName).map(Self)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl TryFrom<String> for GraphName {
    type Error = Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::new(value)
    }
}

impl From<GraphName> for String {
    fn from(value: GraphName) -> Self {
        value.0
    }
}