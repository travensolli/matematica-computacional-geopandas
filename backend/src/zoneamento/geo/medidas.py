"""Medidas das geometrias, sempre num sistema métrico."""

import geopandas as gpd
import pandas as pd

from zoneamento.geo.crs import CRS_METRICO

METROS_QUADRADOS_POR_KM2 = 1_000_000


def area_m2(gdf: gpd.GeoDataFrame | gpd.GeoSeries) -> pd.Series:
    """Área de cada geometria em m², um número real positivo (ℝ₊)."""
    if len(gdf) == 0:
        return pd.Series(dtype="float64", index=gdf.index)
    return gdf.to_crs(CRS_METRICO).area


def area_km2(gdf: gpd.GeoDataFrame | gpd.GeoSeries, casas: int = 3) -> pd.Series:
    """Área de cada geometria em km², arredondada para exibição."""
    return (area_m2(gdf) / METROS_QUADRADOS_POR_KM2).round(casas)
