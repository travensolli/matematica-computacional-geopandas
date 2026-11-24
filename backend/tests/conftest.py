"""Fixtures compartilhadas pelos testes do backend."""

import geopandas as gpd
import pytest
from shapely.geometry import Point, box

from zoneamento.geo.crs import CRS_METRICO

# Quadrados 2 m × 2 m num sistema métrico, perto das coordenadas UTM de Jacareí. Como A e B se
# sobrepõem numa faixa de 1 m × 2 m, as áreas esperadas são exatas: |A| = |B| = 4, |A ∩ B| = 2,
# |A ∪ B| = 6, |A − B| = 2 e |A Δ B| = 4.
X0, Y0 = 400_000.0, 7_420_000.0


@pytest.fixture
def quadrado_a() -> gpd.GeoDataFrame:
    return gpd.GeoDataFrame(
        {"id": [1], "nome": ["A"]}, geometry=[box(X0, Y0, X0 + 2, Y0 + 2)], crs=CRS_METRICO
    )


@pytest.fixture
def quadrado_b() -> gpd.GeoDataFrame:
    return gpd.GeoDataFrame(
        {"id": [2], "nome": ["B"]}, geometry=[box(X0 + 1, Y0, X0 + 3, Y0 + 2)], crs=CRS_METRICO
    )


@pytest.fixture
def areas_ab(quadrado_a, quadrado_b) -> gpd.GeoDataFrame:
    return gpd.GeoDataFrame(
        {"id": [1, 2], "nome": ["A", "B"]},
        geometry=[quadrado_a.geometry.iloc[0], quadrado_b.geometry.iloc[0]],
        crs=CRS_METRICO,
    )


@pytest.fixture
def pontos() -> gpd.GeoDataFrame:
    """p1 só em A, p2 em A ∩ B, p3 só em B, p4 fora de tudo e p5 sobre a borda de A."""
    return gpd.GeoDataFrame(
        {"id": [1, 2, 3, 4, 5], "nome": ["p1", "p2", "p3", "p4", "p5"]},
        geometry=[
            Point(X0 + 0.5, Y0 + 1),
            Point(X0 + 1.5, Y0 + 1),
            Point(X0 + 2.5, Y0 + 1),
            Point(X0 + 9, Y0 + 9),
            Point(X0, Y0 + 1),
        ],
        crs=CRS_METRICO,
    )
