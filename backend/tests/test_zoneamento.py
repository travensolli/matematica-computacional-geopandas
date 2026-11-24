"""Classificação, consulta de ponto e sobreposições sobre o exemplo sintético."""

import geopandas as gpd
import pandas as pd
import pytest
from shapely.geometry import box

from zoneamento.dominio.erros import ErroValidacao
from zoneamento.geo.camada import camada_vazia
from zoneamento.geo.crs import CRS_GEOGRAFICO
from zoneamento.geo.zoneamento import classificar_areas, consultar_ponto, sobreposicoes

A, B, C, D = (
    "Área A: núcleo central",
    "Área B: faixa industrial leste",
    "Área C: bairro residencial sul",
    "Área D: corredor misto",
)


def _por_nome(gdf, coluna):
    return dict(zip(gdf["nome"], gdf[coluna], strict=True))


@pytest.fixture
def classificadas(areas_sinteticas, estabelecimentos_sinteticos):
    return classificar_areas(areas_sinteticas, estabelecimentos_sinteticos)


def test_classificacao_das_areas(classificadas):
    assert _por_nome(classificadas, "classes") == {
        A: ["escolar"],
        B: ["industrial"],
        C: ["residencial"],
        D: ["escolar", "industrial"],
    }


def test_contagens_e_elementos_de_cada_area(classificadas):
    d = classificadas[classificadas["nome"] == D].iloc[0]
    assert (d["escolas"], d["industrias"], d["residencias"]) == (1, 1, 0)
    assert d["tipos_presentes"] == ["escola", "industria"]
    assert d["estabelecimentos"] == [2, 5]
    # A metalúrgica (5) também está em B: um elemento pode pertencer a dois conjuntos.
    assert 5 in classificadas[classificadas["nome"] == B].iloc[0]["estabelecimentos"]


def test_area_em_km2_e_positiva(classificadas):
    assert (classificadas["area_km2"] > 0).all()


def test_ponto_em_duas_areas_sobrepostas(classificadas):
    r = consultar_ponto(classificadas, -23.3040, -45.9600)
    assert {a["nome"] for a in r["areas"]} == {A, D}
    assert r["classes"] == ["escolar", "industrial"]
    assert r["resumo"] == "Área escolar e industrial."
    assert r["total_areas"] == 4
    assert r["ponto"] == {"lat": -23.3040, "lng": -45.9600}


def test_ponto_residencial(classificadas):
    assert consultar_ponto(classificadas, -23.3250, -45.9650)["classes"] == ["residencial"]


def test_ponto_fora_de_tudo(classificadas):
    r = consultar_ponto(classificadas, -23.3400, -45.9900)
    assert r["areas"] == []
    assert r["classes"] == []
    assert r["resumo"] == "O ponto não está em nenhuma área cadastrada."


def test_residencial_exige_somente_residencias(areas_sinteticas, estabelecimentos_sinteticos):
    escola_em_c = gpd.GeoDataFrame(
        {"id": [99], "nome": ["Escola nova"], "tipo": ["escola"]},
        geometry=gpd.points_from_xy([-45.9650], [-23.3250]),
        crs=CRS_GEOGRAFICO,
    )
    estabelecimentos = gpd.GeoDataFrame(
        pd.concat([estabelecimentos_sinteticos, escola_em_c], ignore_index=True),
        crs=CRS_GEOGRAFICO,
    )
    assert _por_nome(classificar_areas(areas_sinteticas, estabelecimentos), "classes")[C] == [
        "escolar"
    ]


def test_area_sem_estabelecimentos(areas_sinteticas, estabelecimentos_sinteticos):
    classificadas = classificar_areas(areas_sinteticas, estabelecimentos_sinteticos.iloc[0:0])
    assert all(classes == [] for classes in classificadas["classes"])
    assert all(elementos == [] for elementos in classificadas["estabelecimentos"])
    r = consultar_ponto(classificadas, -23.3040, -45.9600)
    assert r["resumo"] == "O ponto está numa área ainda sem estabelecimentos."


def test_sem_areas(estabelecimentos_sinteticos):
    vazia = camada_vazia(["id", "nome"])
    classificadas = classificar_areas(vazia, estabelecimentos_sinteticos)
    assert classificadas.empty
    assert consultar_ponto(classificadas, -23.3, -45.9)["areas"] == []


def test_consulta_valida_a_coordenada(classificadas):
    with pytest.raises(ErroValidacao):
        consultar_ponto(classificadas, "x", -45.9)


def test_sobreposicoes(areas_sinteticas):
    s = sobreposicoes(areas_sinteticas)
    assert {(linha.nome_1, linha.nome_2) for linha in s.itertuples()} == {(A, D), (B, D)}
    assert (s["area_m2"] > 0).all()


def test_sobreposicoes_com_menos_de_duas_areas(areas_sinteticas):
    assert sobreposicoes(areas_sinteticas.iloc[:1]).empty


def test_areas_que_so_se_tocam_nao_se_sobrepoem():
    vizinhas = gpd.GeoDataFrame(
        {"id": [1, 2], "nome": ["oeste", "leste"]},
        geometry=[box(-45.97, -23.31, -45.96, -23.30), box(-45.96, -23.31, -45.95, -23.30)],
        crs=CRS_GEOGRAFICO,
    )
    assert sobreposicoes(vizinhas).empty
