use crate::port::DataType;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum Value {
    Bool(bool),
    Int(i64),
    Float(f64),
    String(String),
}

impl Value {
    pub fn matches(&self, data_type: &DataType) -> bool {
        match (self, data_type) {
            (Self::Bool(_), DataType::Bool)
            | (Self::Int(_), DataType::Int | DataType::Pin)
            | (Self::String(_), DataType::String) => true,
            (Self::Float(value), DataType::Float) => value.is_finite(),
            (Self::Int(_), DataType::Float) => true,
            _ => false,
        }
    }
}
