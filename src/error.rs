use std::fmt;

#[derive(Debug, PartialEq, Eq)]
pub enum Error {
    EmptyNodeType,
}

impl fmt::Display for Error {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::EmptyNodeType => formatter.write_str("node type cannot be empty or whitespace-only"),
        }
    }
}

impl std::error::Error for Error {}
