"""Conversão de GeoDataFrames e registros em GeoJSON, o formato que o Leaflet consome."""

import json
import math
from typing import Any

import geopandas as gpd
from shapely.geometry import mapping

from zoneamento.geo.crs import CRS_GEOGRAFICO


def _valor(valor: Any) -> Any:
    """Converte tipos do numpy e do pandas em tipos do JSON; NaN vira null."""
    if hasattr(valor, "tolist"):
        valor = valor.tolist()
    if isinstance(valor, float) and math.isnan(valor):
        return None
    return valor


def colecao(gdf: gpd.GeoDataFrame) -> dict[str, Any]:
    """FeatureCollection com todas as colunas como propriedades."""
    if len(gdf) == 0:
        return {"type": "FeatureCollection", "features": []}
    return json.loads(gdf.to_crs(CRS_GEOGRAFICO).to_json(drop_id=True, na="null"))


def feature(registro: dict[str, Any], coluna_geometria: str = "geometry") -> dict[str, Any]:
    """Um registro (dicionário com geometria do Shapely) como Feature GeoJSON."""
    propriedades = {
        chave: _valor(valor) for chave, valor in registro.items() if chave != coluna_geometria
    }
    return {
        "type": "Feature",
        "properties": propriedades,
        "geometry": mapping(registro[coluna_geometria]),
    }


def linha_como_feature(gdf: gpd.GeoDataFrame, registro_id: int) -> dict[str, Any]:
    """A linha de id `registro_id` de uma camada como Feature."""
    linha = gdf[gdf["id"] == registro_id]
    return colecao(linha)["features"][0]
