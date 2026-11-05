use crate::error::Error;
use crate::non_empty_string::NonEmptyString;
use crate::port::Port;
use crate::value::Value;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
#[serde(try_from = "NodeData")]
pub struct Node {
    id: Uuid,
    node_type: NonEmptyString,
    position: NodePosition,
    ports: HashMap<String, Port>,
    values: HashMap<String, Value>,
    #[serde(skip)]
    ports_locked: bool,
}

impl Node {
    pub fn new(node_type: impl Into<String>, position: NodePosition) -> Result<Self, Error> {
        Ok(Self {
            id: Uuid::new_v4(),
            node_type: NonEmptyString::new(node_type, "node type")?,
            position,
            ports: HashMap::new(),
            ports_locked: false,
            values: HashMap::new(),
        })
    }

    pub fn set_position(&mut self, position: NodePosition) {
        self.position = position;
    }

    pub fn id(&self) -> Uuid {
        self.id
    }

    pub fn node_type(&self) -> &str {
        self.node_type.as_str()
    }

    pub fn position(&self) -> &NodePosition {
        &self.position
    }

    pub fn add_port(&mut self, port: Port) -> Result<(), Error> {
        if self.ports_locked {
            return Err(Error::PortsLocked);
        }

        if self.ports.contains_key(port.id()) {
            return Err(Error::DuplicateId(port.id().to_owned()));
        }

        self.ports.insert(port.id().to_string(), port);
        Ok(())
    }

    pub fn get_port(&self, id: &str) -> Option<&Port> {
        self.ports.get(id)
    }

    pub fn port_count(&self) -> usize {
        self.ports.len()
    }

    pub fn ports(&self) -> impl Iterator<Item = &Port> {
        self.ports.values()
    }

    pub fn values(&self) -> &HashMap<String, Value> {
        &self.values
    }

    pub fn set_value(&mut self, port_id: &str, value: Value) -> Result<(), Error> {
        let port = self.ports.get(port_id).ok_or_else(|| Error::PortNotFound {
            node_id: self.id,
            port_id: port_id.to_owned(),
        })?;
        if !port
            .data_type()
            .is_some_and(|data_type| value.matches(data_type))
        {
            return Err(Error::InvalidPortDataType);
        }
        self.values.insert(port_id.to_owned(), value);
        Ok(())
    }

    pub(crate) fn lock_ports(&mut self) {
        self.ports_locked = true;
    }
}

#[derive(Debug, Deserialize, PartialEq, Serialize)]
pub struct NodePosition {
    pub x: f32,
    pub y: f32,
}

fn deserialize_ports<'de, D>(deserializer: D) -> Result<HashMap<String, Port>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    use serde::de::Error as _;

    let ports = HashMap::<String, Port>::deserialize(deserializer)?;
    if ports.iter().any(|(id, port)| id != port.id()) {
        return Err(D::Error::custom("port key must match its ID"));
    }

    Ok(ports)
}

#[derive(Deserialize)]
struct NodeData {
    id: Uuid,
    node_type: NonEmptyString,
    position: NodePosition,
    #[serde(deserialize_with = "deserialize_ports")]
    ports: HashMap<String, Port>,
    values: HashMap<String, Value>,
}

impl TryFrom<NodeData> for Node {
    type Error = Error;

    fn try_from(data: NodeData) -> Result<Self, Error> {
        let mut node = Self {
            id: data.id,
            node_type: data.node_type,
            position: data.position,
            ports: data.ports,
            values: HashMap::new(),
            ports_locked: false,
        };
        for (id, value) in data.values {
            node.set_value(&id, value)?;
        }
        Ok(node)
    }
}
