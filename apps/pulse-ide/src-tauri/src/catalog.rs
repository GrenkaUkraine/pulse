use pulse_core::port::{DataType, PortDirection, PortKind};
use pulse_nodes::{
    catalog,
    definition::{ControlKind, DefaultValue, NodeKind, PortDefinition},
};
use serde::Serialize;

#[derive(Serialize)]
pub(crate) struct CatalogEntry {
    id: &'static str,
    title: &'static str,
    description: &'static str,
    category: CatalogCategory,
    pins: Vec<CatalogPin>,
    kind: NodeKind,
}

#[derive(Serialize)]
pub(crate) struct CatalogCategory {
    id: &'static str,
    title: &'static str,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CatalogPin {
    id: &'static str,
    direction: &'static str,
    data_type: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    title: Option<&'static str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    control: Option<ControlKind>,
    show_control: bool,
    max_connections: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    default_value: Option<DefaultValue>,
}

impl From<PortDefinition> for CatalogPin {
    fn from(port: PortDefinition) -> Self {
        let data_type = match (port.kind, port.data_type) {
            (PortKind::Execution, _) => "execution",
            (PortKind::Data, Some(DataType::Bool)) => "boolean",
            (PortKind::Data, Some(DataType::Int)) => "int",
            (PortKind::Data, Some(DataType::Float)) => "float",
            (PortKind::Data, Some(DataType::String)) => "string",
            (PortKind::Data, None) => {
                unreachable!("data port definitions must specify a data type")
            }
        };
        Self {
            id: port.id,
            direction: match port.direction {
                PortDirection::Input => "input",
                PortDirection::Output => "output",
            },
            data_type,
            title: port.title,
            control: port.control,
            show_control: port.show_control,
            max_connections: port.max_connections,
            default_value: port.default_value,
        }
    }
}

#[tauri::command]
pub(crate) fn get_node_catalog() -> Vec<CatalogEntry> {
    catalog::definitions()
        .map(|definition| CatalogEntry {
            id: definition.id,
            title: definition.display_name,
            description: definition.description,
            kind: definition.kind,
            category: CatalogCategory {
                id: definition.category.id(),
                title: definition.category.display_name(),
            },
            pins: definition.ports.into_iter().map(CatalogPin::from).collect(),
        })
        .collect()
}
