"""Acesso ao repositório da aplicação e às áreas já classificadas."""

import geopandas as gpd
from flask import current_app

from zoneamento.geo import conjuntos
from zoneamento.geo.zoneamento import classificar_areas
from zoneamento.repositorio.camadas import RepositorioGeo


def repositorio() -> RepositorioGeo:
    return current_app.extensions["repositorio"]


def areas_classificadas() -> gpd.GeoDataFrame:
    """Áreas com a classificação e o teste A ⊆ U contra o limite do município."""
    repo = repositorio()
    classificadas = classificar_areas(repo.areas(), repo.estabelecimentos())
    municipio = repo.municipio()
    if municipio is None or municipio.empty:
        classificadas["dentro_do_municipio"] = None
    else:
        universo = municipio.geometry.union_all()
        classificadas["dentro_do_municipio"] = [
            conjuntos.subconjunto(area, universo) for area in classificadas.geometry
        ]
    return classificadas
