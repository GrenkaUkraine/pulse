use crate::non_empty_string::NonEmptyString;
use crate::error::Error;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, PartialEq, Eq, Serialize)]
pub enum PortKind {
    Execution,
    Data,
}

#[derive(Debug, Deserialize, PartialEq, Eq, Serialize)]
pub enum PortDirection {
    Input,
    Output,
}

#[derive(Debug, Deserialize, PartialEq, Eq, Serialize)]
pub enum DataType {
    Bool,
    Int,
    Float,
    String,
}

#[derive(Debug, Serialize)]
pub struct Port {
    id: NonEmptyString,
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
        match (&kind, &data_type) {
            (PortKind::Execution, Some(_)) | (PortKind::Data, None) => {
                return Err(Error::InvalidPortDataType);
            }
            _ => {}
        }

        Ok(Self {
            id: NonEmptyString::new(id, "port ID")?,
            kind,
            direction,
            data_type,
        })
    }

    pub fn id(&self) -> &str {
        self.id.as_str()
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

impl<'de> Deserialize<'de> for Port {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        use serde::de::Error as _;

        #[derive(Deserialize)]
        struct PortData {
            id: String,
            kind: PortKind,
            direction: PortDirection,
            data_type: Option<DataType>,
        }

        let port = PortData::deserialize(deserializer)?;
        Self::new(port.id, port.kind, port.direction, port.data_type).map_err(D::Error::custom)
    }
}
