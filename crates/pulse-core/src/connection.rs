use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
pub struct Connection {
    id: Uuid,
    from_node: Uuid,
    from_port: String,
    to_node: Uuid,
    to_port: String,
}

impl Connection {
    pub(crate) fn new(
        from_node: Uuid,
        from_port: impl Into<String>,
        to_node: Uuid,
        to_port: impl Into<String>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            from_node,
            from_port: from_port.into(),
            to_node,
            to_port: to_port.into(),
        }
    }

    pub fn id(&self) -> Uuid {
        self.id
    }

    pub fn from_node(&self) -> Uuid {
        self.from_node
    }

    pub fn from_port(&self) -> &str {
        &self.from_port
    }

    pub fn to_node(&self) -> Uuid {
        self.to_node
    }

    pub fn to_port(&self) -> &str {
        &self.to_port
    }
}