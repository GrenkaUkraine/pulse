use std::fmt;

#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    DuplicateNodeId,
    DuplicatePortId,
    EmptyGraphName,
    EmptyNodeType,
    EmptyPortId,
    PortsLocked,
}

impl fmt::Display for Error {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::DuplicateNodeId => formatter.write_str("a node with this UUID already exists"),
            Self::DuplicatePortId => formatter.write_str("a port with this ID already exists"),
            Self::EmptyGraphName => formatter.write_str("graph name cannot be empty or whitespace-only"),
            Self::EmptyNodeType => formatter.write_str("node type cannot be empty or whitespace-only"),
            Self::EmptyPortId => formatter.write_str("port ID cannot be empty or whitespace-only"),
            Self::PortsLocked => formatter.write_str("node ports cannot be changed after adding the node to a graph"),
        }
    }
}

impl std::error::Error for Error {}

pub(crate) fn validate_non_empty(value: String, error: Error) -> Result<String, Error> {
    if value.trim().is_empty() {
        return Err(error);
    }

    Ok(value)
}
