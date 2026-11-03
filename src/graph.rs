use crate::{
    error::{validate_non_empty, Error},
    node::Node,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
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

        self.nodes.insert(node.id(), node);
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