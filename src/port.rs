use crate::error::{validate_non_empty, Error};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub enum PortKind {
    Execution,
    Data,
}

#[derive(Debug, Deserialize, Serialize)]
pub enum PortDirection {
    Input,
    Output,
}

#[derive(Debug, Deserialize, Serialize)]
pub enum DataType {
    Bool,
    Int,
    Float,
    String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Port {
    id: PortId,
    kind: PortKind,
    direction: PortDirection,
    data_type: Option<DataType>,
}

impl Port {
    pub fn new(
        id: impl Into<String>,
        kind: PortKind,
        direction: PortDirection,
        data_type: Option<DataType>,
    ) -> Result<Self, Error> {
        Ok(Self {
            id: PortId::new(id)?,
            kind,
            direction,
            data_type,
        })
    }

    pub fn id(&self) -> &str {
        &self.id.as_str()
    }

    pub fn kind(&self) -> &PortKind {
        &self.kind
    }

    pub fn direction(&self) -> &PortDirection {
        &self.direction
    }

    pub fn data_type(&self) -> Option<&DataType> {
        self.data_type.as_ref()
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(try_from = "String", into = "String")]
pub struct PortId(String);

impl PortId {
    pub fn new(value: impl Into<String>) -> Result<Self, Error> {
        validate_non_empty(value.into(), Error::EmptyPortId).map(Self)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl TryFrom<String> for PortId {
    type Error = Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::new(value)
    }
}

impl From<PortId> for String {
    fn from(value: PortId) -> Self {
        value.0
    }
}