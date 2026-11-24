"""A semente versionada de Jacareí tem todos os casos que a demonstração usa."""

from pathlib import Path

import geopandas as gpd
import pytest

from zoneamento.geo import conjuntos
from zoneamento.geo.zoneamento import classificar_areas, consultar_ponto, sobreposicoes

SEMENTE = Path(__file__).resolve().parents[1] / "dados" / "semente"


@pytest.fixture(scope="module")
def municipio():
    return gpd.read_file(SEMENTE / "municipio.geojson")


@pytest.fixture(scope="module")
def areas():
    return gpd.read_file(SEMENTE / "areas.geojson")


@pytest.fixture(scope="module")
def estabelecimentos():
    return gpd.read_file(SEMENTE / "estabelecimentos.geojson")


@pytest.fixture(scope="module")
def classificadas(areas, estabelecimentos):
    return classificar_areas(areas, estabelecimentos)


def _por_nome(gdf, nome):
    return gdf[gdf["nome"] == nome].iloc[0]


def test_universo_e_jacarei(municipio):
    assert municipio["codarea"].tolist() == ["3524402"]
    assert municipio["nome"].tolist() == ["Jacareí"]


def test_todos_os_casos_de_classificacao(classificadas):
    classes = {
        nome: tuple(c)
        for nome, c in zip(classificadas["nome"], classificadas["classes"], strict=True)
    }
    assert classes["Entorno da Fatec Jacareí"] == ("escolar",)
    assert classes["Polo industrial da Via Dutra"] == ("escolar", "industrial")
    assert classes["Distrito industrial BASF–Sany"] == ("industrial",)
    assert classes["Residencial Fogaça"] == ("residencial",)
    assert classes["Viveiro Municipal"] == ()
    assert set(classes.values()) >= {
        ("escolar",),
        ("industrial",),
        ("residencial",),
        ("escolar", "industrial"),
        (),
    }


def test_tudo_dentro_do_universo(municipio, areas, estabelecimentos):
    u = municipio.geometry.union_all()
    assert all(conjuntos.subconjunto(area, u) for area in areas.geometry)
    assert estabelecimentos.within(u).all()


def test_subconjuntos_proprios_reais(areas):
    parque = _por_nome(areas, "Parque da Cidade").geometry
    entorno = _por_nome(areas, "Entorno da Fatec Jacareí").geometry
    raio = _por_nome(areas, "Raio de 1 km da Fatec").geometry
    assert conjuntos.subconjunto_proprio(parque, entorno)
    assert conjuntos.subconjunto_proprio(entorno, raio)


def test_ha_ao_menos_duas_sobreposicoes(areas):
    assert len(sobreposicoes(areas)) >= 2


def test_fatec_na_coordenada_do_material(estabelecimentos):
    fatec = _por_nome(estabelecimentos, "Fatec Jacareí")
    assert fatec["tipo"] == "escola"
    assert fatec["fonte"] == "material de apoio, Figura 14"
    assert (fatec.geometry.x, fatec.geometry.y) == pytest.approx((-45.96692, -23.29521))


def test_fontes_declaradas(estabelecimentos):
    assert set(estabelecimentos["fonte"]) == {
        "OpenStreetMap",
        "material de apoio, Figura 14",
        "ilustrativa",
    }
    residencias = estabelecimentos[estabelecimentos["tipo"] == "residencia"]
    assert (residencias["fonte"] == "ilustrativa").all()
    osm = estabelecimentos[estabelecimentos["fonte"] == "OpenStreetMap"]
    assert osm["osm_id"].notna().all()
    assert estabelecimentos["nome"].is_unique


@pytest.mark.parametrize(
    ("lat", "lng", "esperado"),
    [
        (-23.29521, -45.96692, ["escolar"]),  # a própria Fatec
        (-23.2850, -45.9800, ["escolar", "industrial"]),  # dentro do polo industrial
        (-23.3420, -45.9300, []),  # fora de todas as áreas
    ],
)
def test_pontos_do_roteiro_de_demonstracao(classificadas, lat, lng, esperado):
    assert consultar_ponto(classificadas, lat, lng)["classes"] == esperado
