use crate::error::Error;
use crate::non_empty_string::NonEmptyString;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
pub enum PortKind {
    Execution,
    Data,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
pub enum PortDirection {
    Input,
    Output,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
pub enum DataType {
    Bool,
    Int,
    Float,
    String,
    Pin,
}

#[derive(Clone, Debug, PartialEq, Serialize)]
pub struct Port {
    id: NonEmptyString,
    kind: PortKind,
    direction: PortDirection,
    data_type: Option<DataType>,
    #[serde(default)]
    max_connections: Option<usize>,
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

        let max_connections = match (&direction, &kind) {
            (PortDirection::Input, _) | (_, PortKind::Execution) => Some(1),
            _ => None,
        };
        Ok(Self {
            id: NonEmptyString::new(id, "port ID")?,
            kind,
            direction,
            data_type,
            max_connections,
        })
    }

    pub fn with_max_connections(mut self, limit: usize) -> Self {
        self.max_connections = Some(limit);
        self
    }

    pub fn with_connection_limit(mut self, limit: Option<usize>) -> Self {
        self.max_connections = limit;
        self
    }

    pub fn max_connections(&self) -> Option<usize> {
        self.max_connections
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
            #[serde(deserialize_with = "deserialize_limit")]
            max_connections: Option<usize>,
        }

        let port = PortData::deserialize(deserializer)?;
        let mut result = Self::new(port.id, port.kind, port.direction, port.data_type)
            .map_err(D::Error::custom)?;
        {
            result.max_connections = port.max_connections;
        }
        Ok(result)
    }
}

fn deserialize_limit<'de, D>(deserializer: D) -> Result<Option<usize>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    Option::<usize>::deserialize(deserializer)
}
