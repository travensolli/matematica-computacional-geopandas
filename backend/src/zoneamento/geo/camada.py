"""Utilidades para criar camadas (GeoDataFrames) em latitude e longitude."""

import geopandas as gpd
import pandas as pd

from zoneamento.geo.crs import CRS_GEOGRAFICO


def camada_vazia(colunas: list[str]) -> gpd.GeoDataFrame:
    """Camada sem linhas, com as colunas pedidas e a coluna de geometria. É o conjunto vazio ∅."""
    return gpd.GeoDataFrame(
        {coluna: pd.Series(dtype="object") for coluna in colunas},
        geometry=gpd.GeoSeries([], crs=CRS_GEOGRAFICO),
        crs=CRS_GEOGRAFICO,
    )
