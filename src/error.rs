use std::fmt;

#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    DuplicateId(String),
    Empty(String),
    PortsLocked,
}

impl fmt::Display for Error {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::DuplicateId(id) => write!(formatter, "an item with ID `{id}` already exists"),
            Self::Empty(field) => write!(formatter, "{field} cannot be empty or whitespace-only"),
            Self::PortsLocked => formatter.write_str("node ports cannot be changed after adding the node to a graph"),
        }
    }
}

impl std::error::Error for Error {}

pub(crate) fn validate_non_empty(value: String, field: &str) -> Result<String, Error> {
    if value.trim().is_empty() {
        return Err(Error::Empty(field.to_owned()));
    }

    Ok(value)
}
