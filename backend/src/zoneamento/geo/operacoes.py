"""Operações entre duas áreas escolhidas, usadas pelo laboratório da parte teórica."""

from collections.abc import Callable
from typing import Any

import geopandas as gpd
from shapely.geometry import mapping

from zoneamento.dominio.erros import ErroValidacao, NaoEncontrado
from zoneamento.geo import conjuntos
from zoneamento.geo.crs import CRS_GEOGRAFICO
from zoneamento.geo.medidas import area_km2

Operacao = Callable[[gpd.GeoDataFrame, gpd.GeoDataFrame], gpd.GeoDataFrame]

#: Operações disponíveis no laboratório. "diferenca_inversa" é B − A.
OPERACOES: dict[str, Operacao] = {
    "uniao": conjuntos.uniao,
    "interseccao": conjuntos.interseccao,
    "diferenca": conjuntos.diferenca,
    "diferenca_inversa": lambda a, b: conjuntos.diferenca(b, a),
    "diferenca_simetrica": conjuntos.diferenca_simetrica,
}


def _uma_area(areas: gpd.GeoDataFrame, area_id: int) -> gpd.GeoDataFrame:
    selecao = areas[areas["id"] == area_id]
    if selecao.empty:
        raise NaoEncontrado(f"Área {area_id} não encontrada.")
    return selecao[["id", "nome", areas.geometry.name]]


def _identificar(area: gpd.GeoDataFrame) -> dict[str, Any]:
    return {"id": int(area["id"].iloc[0]), "nome": area["nome"].iloc[0]}


def operar(
    areas: gpd.GeoDataFrame,
    estabelecimentos: gpd.GeoDataFrame,
    id_a: int,
    id_b: int,
    operacao: str,
) -> dict[str, Any]:
    """Aplica a operação de conjuntos entre as áreas A e B e mede o resultado."""
    if operacao not in OPERACOES:
        raise ErroValidacao("Operação desconhecida. Use: " + ", ".join(OPERACOES) + ".", "operacao")
    a, b = _uma_area(areas, id_a), _uma_area(areas, id_b)
    pedacos = OPERACOES[operacao](a, b)
    geometria = pedacos.geometry.union_all() if len(pedacos) else None
    vazio = geometria is None or geometria.is_empty

    dentro: list[int] = []
    if not vazio and len(estabelecimentos):
        resultado = gpd.GeoDataFrame({"r": [1]}, geometry=[geometria], crs=CRS_GEOGRAFICO)
        pares = conjuntos.pertence(
            estabelecimentos[["id", estabelecimentos.geometry.name]], resultado
        )
        dentro = sorted(int(i) for i in pares["id"])

    return {
        "operacao": operacao,
        "a": _identificar(a),
        "b": _identificar(b),
        "vazio": vazio,
        "geometria": None if vazio else mapping(geometria),
        "area_km2": 0.0
        if vazio
        else float(area_km2(gpd.GeoSeries([geometria], crs=CRS_GEOGRAFICO)).iloc[0]),
        "estabelecimentos": dentro,
    }


def relacoes(areas: gpd.GeoDataFrame, id_a: int, id_b: int) -> dict[str, Any]:
    """Igualdade, inclusão e disjunção entre as áreas A e B."""
    a, b = _uma_area(areas, id_a), _uma_area(areas, id_b)
    ga, gb = a.geometry.iloc[0], b.geometry.iloc[0]
    return {
        "a": _identificar(a),
        "b": _identificar(b),
        "iguais": conjuntos.iguais(ga, gb),
        "a_subconjunto_b": conjuntos.subconjunto(ga, gb),
        "b_subconjunto_a": conjuntos.subconjunto(gb, ga),
        "a_subconjunto_proprio_b": conjuntos.subconjunto_proprio(ga, gb),
        "b_subconjunto_proprio_a": conjuntos.subconjunto_proprio(gb, ga),
        "disjuntos": conjuntos.disjuntos(ga, gb),
    }


def resumo_produto(
    estabelecimentos: gpd.GeoDataFrame, areas: gpd.GeoDataFrame, amostra: int = 12
) -> dict[str, Any]:
    """|E × A| contra a quantidade de pares que sobram ao exigir e ∈ a, e uma amostra dos pares."""
    e = estabelecimentos[["id", "nome", estabelecimentos.geometry.name]]
    a = areas[["id", "nome", areas.geometry.name]]
    pares = conjuntos.produto(e, a)
    selecionados = conjuntos.juncao_pelo_produto(e, a)
    chaves = set(zip(selecionados["id_e"], selecionados["id_a"], strict=True))
    fora = conjuntos.fora_de_todas(e, a) if len(a) else e

    exemplos = [
        {
            "estabelecimento": linha["nome_e"],
            "area": linha["nome_a"],
            "pertence": (linha["id_e"], linha["id_a"]) in chaves,
        }
        for _, linha in pares.head(amostra).iterrows()
    ]
    return {
        "estabelecimentos": len(e),
        "areas": len(a),
        "pares": len(pares),
        "pares_com_pertinencia": len(selecionados),
        "fora_de_todas": sorted(int(i) for i in fora["id"]),
        "amostra": exemplos,
    }
