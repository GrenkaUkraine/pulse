use crate::error::Error;
use serde::{Deserialize, Serialize};
use uuid::Uuid;


#[derive(Debug, Deserialize, Serialize)]
pub struct Node {
    pub id: Uuid,
    pub node_type: NodeType,
    pub position: NodePosition,
}

impl Node {
    pub fn new(node_type: impl Into<String>, position: NodePosition) -> Result<Self, Error> {
        Ok(Self {
            id: Uuid::new_v4(),
            node_type: NodeType::new(node_type)?,
            position,
        })
    }

    pub fn set_position(&mut self, position: NodePosition) {
        self.position = position;
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct NodeType(String);

impl NodeType {
    pub fn new(value: impl Into<String>) -> Result<Self, Error> {
        let value = value.into();
        if value.trim().is_empty() {
            return Err(Error::EmptyNodeType);
        }

        Ok(Self(value))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl TryFrom<String> for NodeType {
    type Error = Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::new(value)
    }
}

impl From<NodeType> for String {
    fn from(value: NodeType) -> Self {
        value.0
    }
}

#[derive(Debug, Deserialize, PartialEq, Serialize)]
pub struct NodePosition {
    pub x: f32,
    pub y: f32,
}