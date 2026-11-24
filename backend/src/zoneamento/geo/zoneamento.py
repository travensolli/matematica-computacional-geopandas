"""Zoneamento: classificação das áreas, consulta de ponto e sobreposições.

Tudo aqui é composto das operações de `conjuntos` e da regra de `dominio.classificacao`. As
funções recebem e devolvem GeoDataFrames em latitude e longitude e não leem nem gravam arquivos.
"""

from typing import Any

import geopandas as gpd
import pandas as pd

from zoneamento.dominio.classificacao import (
    classes_da_area,
    classes_do_ponto,
    descrever,
    ordenar_classes,
)
from zoneamento.dominio.tipos import TipoEstabelecimento
from zoneamento.geo import conjuntos
from zoneamento.geo.camada import camada_vazia
from zoneamento.geo.crs import CRS_GEOGRAFICO
from zoneamento.geo.medidas import area_km2, area_m2
from zoneamento.geo.validacao import validar_ponto

TIPOS = [tipo.value for tipo in TipoEstabelecimento]

#: Coluna com |E(a) ∩ X| para cada tipo X de estabelecimento.
COLUNA_CONTAGEM = {"escola": "escolas", "industria": "industrias", "residencia": "residencias"}

#: Abaixo disso, em m², duas áreas só encostam uma na outra: não contam como sobreposição.
AREA_MINIMA_SOBREPOSICAO_M2 = 1.0

COLUNAS_SOBREPOSICAO = ["id_1", "nome_1", "id_2", "nome_2", "area_m2"]


def _coluna_objeto(valores: list[Any], indice: pd.Index) -> pd.Series:
    return pd.Series(valores, index=indice, dtype="object")


def classificar_areas(
    areas: gpd.GeoDataFrame, estabelecimentos: gpd.GeoDataFrame
) -> gpd.GeoDataFrame:
    """Acrescenta a cada área E(a), as contagens por tipo, T(a), as classes e a área em km².

    E(a) = {e ∈ E | e ∈ a} vem da pertinência, uma junção espacial. As contagens são as
    cardinalidades |E(a) ∩ escolas|, |E(a) ∩ indústrias| e |E(a) ∩ residências|.
    """
    resultado = areas.copy()
    ids_area = pd.Index(resultado["id"].astype(int), name="area_id")
    contagem = pd.DataFrame(0, index=ids_area, columns=TIPOS)
    elementos: dict[int, list[int]] = {int(i): [] for i in ids_area}

    if len(resultado) and len(estabelecimentos):
        pares = conjuntos.pertence(
            estabelecimentos[["id", "tipo", estabelecimentos.geometry.name]].rename(
                columns={"id": "estabelecimento_id"}
            ),
            resultado[["id", resultado.geometry.name]].rename(columns={"id": "area_id"}),
        )
        if len(pares):
            por_tipo = pares.groupby(["area_id", "tipo"]).size().unstack(fill_value=0)
            contagem = por_tipo.reindex(index=ids_area, columns=TIPOS, fill_value=0)
            for area_id, grupo in pares.groupby("area_id"):
                elementos[int(area_id)] = sorted(int(e) for e in grupo["estabelecimento_id"])

    contagem = contagem.astype(int)
    for tipo, coluna in COLUNA_CONTAGEM.items():
        resultado[coluna] = contagem[tipo].to_numpy()
    presentes = [[tipo for tipo in TIPOS if linha[tipo] > 0] for _, linha in contagem.iterrows()]
    classes = [[c.value for c in ordenar_classes(classes_da_area(t))] for t in presentes]
    resultado["tipos_presentes"] = _coluna_objeto(presentes, resultado.index)
    resultado["classes"] = _coluna_objeto(classes, resultado.index)
    resultado["estabelecimentos"] = _coluna_objeto(
        [elementos[int(i)] for i in ids_area], resultado.index
    )
    resultado["area_km2"] = area_km2(resultado)
    return resultado


def consultar_ponto(areas_classificadas: gpd.GeoDataFrame, lat: Any, lng: Any) -> dict[str, Any]:
    """Classes do ponto p: A(p) = {a ∈ A | p ∈ a} e classes(p) = ⋃ classes(a), com a ∈ A(p).

    Como as áreas podem se sobrepor, o ponto pode pertencer a várias delas ao mesmo tempo, e a
    resposta é a união das classes de todas.
    """
    p = validar_ponto(lat, lng)
    ponto = gpd.GeoDataFrame({"consulta": [1]}, geometry=[p], crs=CRS_GEOGRAFICO)

    contem: list[dict[str, Any]] = []
    if len(areas_classificadas):
        colunas = ["id", "nome", "classes", areas_classificadas.geometry.name]
        pares = conjuntos.pertence(ponto, areas_classificadas[colunas]).sort_values("id")
        contem = [
            {"id": int(linha["id"]), "nome": linha["nome"], "classes": list(linha["classes"])}
            for _, linha in pares.iterrows()
        ]

    classes = ordenar_classes(classes_do_ponto(area["classes"] for area in contem))
    if not contem:
        resumo = "O ponto não está em nenhuma área cadastrada."
    elif not classes:
        resumo = "O ponto está numa área ainda sem estabelecimentos."
    else:
        resumo = descrever(classes) + "."

    return {
        "ponto": {"lat": p.y, "lng": p.x},
        "classes": [c.value for c in classes],
        "areas": contem,
        "total_areas": len(areas_classificadas),
        "resumo": resumo,
    }


def sobreposicoes(areas: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """A ∩ B para cada par de áreas distintas que se sobrepõem, eq. (14)."""
    if len(areas) < 2:
        return camada_vazia(COLUNAS_SOBREPOSICAO)
    base = areas[["id", "nome", areas.geometry.name]]
    inter = conjuntos.interseccao(base, base)
    # A ∩ A é a própria A, e B ∩ A repete A ∩ B: fica só o par com id_1 < id_2.
    inter = inter[inter["id_1"] < inter["id_2"]].copy()
    inter["area_m2"] = area_m2(inter).round(0)
    inter = inter[inter["area_m2"] >= AREA_MINIMA_SOBREPOSICAO_M2]
    if inter.empty:
        return camada_vazia(COLUNAS_SOBREPOSICAO)
    return inter[[*COLUNAS_SOBREPOSICAO, inter.geometry.name]].reset_index(drop=True)
