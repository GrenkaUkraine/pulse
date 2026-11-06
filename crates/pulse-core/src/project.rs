use crate::error::Error;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum PinMode {
    Unused,
    Input,
    Output,
    InputPullup,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ProjectSettings {
    pub description: String,
    pin_modes: BTreeMap<u8, PinMode>,
    pin_names: BTreeMap<u8, String>,
}

impl Default for ProjectSettings {
    fn default() -> Self {
        Self {
            description: String::new(),
            pin_modes: (0..20).map(|pin| (pin, PinMode::Unused)).collect(),
            pin_names: BTreeMap::new(),
        }
    }
}

impl ProjectSettings {
    pub fn pins(&self) -> impl Iterator<Item = (u8, PinMode)> + '_ {
        self.pin_modes.iter().map(|(&pin, &mode)| (pin, mode))
    }

    pub fn pin_mode(&self, pin: u8) -> Option<PinMode> {
        self.pin_modes.get(&pin).copied()
    }

    pub fn pin_name(&self, pin: u8) -> Option<&str> {
        self.pin_names.get(&pin).map(String::as_str)
    }

    pub fn set_pin_name(&mut self, pin: u8, name: String) -> Result<(), Error> {
        if !self.pin_modes.contains_key(&pin) {
            return Err(Error::InvalidBoardPin(pin));
        }
        let name = name.trim();
        if name.is_empty() {
            self.pin_names.remove(&pin);
        } else {
            self.pin_names.insert(pin, name.to_owned());
        }
        Ok(())
    }

    pub fn set_pin_mode(&mut self, pin: u8, mode: PinMode) -> Result<(), Error> {
        let current = self
            .pin_modes
            .get_mut(&pin)
            .ok_or(Error::InvalidBoardPin(pin))?;
        *current = mode;
        Ok(())
    }

    pub(crate) fn validate(&self) -> Result<(), String> {
        if self
            .pin_names
            .iter()
            .any(|(pin, name)| !self.pin_modes.contains_key(pin) || name.trim().is_empty())
        {
            return Err("invalid pin name".to_owned());
        }
        if self.pin_modes.len() != 20 || self.pin_modes.keys().copied().ne(0..20) {
            return Err("invalid Arduino Uno pin configuration".to_owned());
        }
        Ok(())
    }
}
