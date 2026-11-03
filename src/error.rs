use std::fmt;

#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    DuplicateNodeId,
    EmptyGraphName,
    EmptyNodeType,
}

impl fmt::Display for Error {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::DuplicateNodeId => formatter.write_str("a node with this UUID already exists"),
            Self::EmptyGraphName => formatter.write_str("graph name cannot be empty or whitespace-only"),
            Self::EmptyNodeType => formatter.write_str("node type cannot be empty or whitespace-only"),
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
