use std::fmt;
use uuid::Uuid;

#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    DuplicateId(String),
    Empty(String),
    InvalidPortDataType,
    NodeNotFound(Uuid),
    PortNotFound { node_id: Uuid, port_id: String },
    InvalidPortDirection,
    PortKindMismatch,
    DataTypeMismatch,
    SelfConnection,
    DuplicateConnection,
    InputPortAlreadyConnected,
    ExecutionOutputAlreadyConnected,
    PortsLocked,
}

impl fmt::Display for Error {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::DuplicateId(id) => write!(formatter, "an item with ID `{id}` already exists"),
            Self::Empty(field) => write!(formatter, "{field} cannot be empty or whitespace-only"),
            Self::InvalidPortDataType => {
                formatter.write_str("execution ports cannot have a data type and data ports must have one")
            }
            Self::NodeNotFound(id) => write!(formatter, "node `{id}` does not exist"),
            Self::PortNotFound { node_id, port_id } => {
                write!(formatter, "port `{port_id}` does not exist on node `{node_id}`")
            }
            Self::InvalidPortDirection => formatter.write_str("ports have invalid directions"),
            Self::PortKindMismatch => formatter.write_str("ports must have the same kind"),
            Self::DataTypeMismatch => formatter.write_str("data port types must match"),
            Self::SelfConnection => formatter.write_str("a node cannot be connected to itself"),
            Self::DuplicateConnection => formatter.write_str("this connection already exists"),
            Self::InputPortAlreadyConnected => formatter.write_str("the input port is already connected"),
            Self::ExecutionOutputAlreadyConnected => {
                formatter.write_str("the execution output port is already connected")
            }
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
