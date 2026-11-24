"""Área medida em metros, nunca em graus."""

import geopandas as gpd
import pytest
from shapely.geometry import box

from zoneamento.geo.crs import CRS_GEOGRAFICO, CRS_METRICO
from zoneamento.geo.medidas import area_km2, area_m2


def test_quadrado_de_um_quilometro_perto_de_jacarei():
    # Um quadrado de 1 km × 1 km construído em UTM e levado para latitude e longitude.
    utm = gpd.GeoSeries([box(400_000, 7_420_000, 401_000, 7_421_000)], crs=CRS_METRICO)
    geografico = utm.to_crs(CRS_GEOGRAFICO)
    assert area_km2(geografico).iloc[0] == pytest.approx(1.0, abs=1e-3)
    assert area_m2(geografico).iloc[0] == pytest.approx(1_000_000, rel=1e-6)


def test_camada_vazia():
    vazia = gpd.GeoSeries([], crs=CRS_GEOGRAFICO)
    assert area_km2(vazia).empty
