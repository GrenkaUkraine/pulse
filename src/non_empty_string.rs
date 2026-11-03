use crate::error::Error;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(try_from = "String")]
pub(crate) struct NonEmptyString(String);

impl NonEmptyString {
    pub(crate) fn new(value: impl Into<String>, field: &str) -> Result<Self, Error> {
        let value = value.into();
        if value.trim().is_empty() {
            return Err(Error::Empty(field.to_owned()));
        }

        Ok(Self(value))
    }

    pub(crate) fn as_str(&self) -> &str {
        &self.0
    }
}

impl TryFrom<String> for NonEmptyString {
    type Error = Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        Self::new(value, "value")
    }
}
