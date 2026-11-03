use crate::{builtins, definition::NodeDefinition};
use pulse_core::{
    error::Error,
    node::{Node, NodePosition},
};
use std::fmt;

#[derive(Debug)]
pub enum CatalogError {
    UnknownNodeType(String),
    InvalidDefinition(Error),
}

impl fmt::Display for CatalogError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnknownNodeType(id) => write!(formatter, "unknown node type: {id}"),
            Self::InvalidDefinition(error) => write!(formatter, "invalid node definition: {error}"),
        }
    }
}

impl std::error::Error for CatalogError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::UnknownNodeType(_) => None,
            Self::InvalidDefinition(error) => Some(error),
        }
    }
}

pub fn definitions() -> impl Iterator<Item = NodeDefinition> {
    builtins::definitions()
}

pub fn find(id: &str) -> Option<NodeDefinition> {
    definitions().find(|definition| definition.id == id)
}

pub fn create(id: &str, position: NodePosition) -> Result<Node, CatalogError> {
    find(id)
        .ok_or_else(|| CatalogError::UnknownNodeType(id.to_owned()))?
        .instantiate(position)
        .map_err(CatalogError::InvalidDefinition)
}
