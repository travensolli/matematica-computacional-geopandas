"""Operações da teoria dos conjuntos aplicadas a camadas geográficas.

Um polígono é um conjunto com infinitos pontos do plano e um estabelecimento é um elemento. Cada
função cita a seção e a equação das notas de aula da disciplina (Carvalho, 2026). As que recebem
GeoDataFrames usam o GeoPandas; as que recebem uma geometria usam o Shapely, que o GeoPandas usa
por baixo.
"""

import geopandas as gpd
import pandas as pd
from shapely.geometry.base import BaseGeometry

#: "No interior do polígono": um ponto exatamente sobre a borda não pertence à área.
PREDICADO_INTERIOR = "within"


def pertence(pontos: gpd.GeoDataFrame, areas: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Pertinência, §1, eq. (1): e ∈ A.

    A junção espacial devolve um par (ponto, área) para cada ponto no interior de cada área.
    """
    return gpd.sjoin(pontos, areas, how="inner", predicate=PREDICADO_INTERIOR)


def fora_de_todas(pontos: gpd.GeoDataFrame, areas: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Diferença, §4.6, eq. (15): os pontos de E que não pertencem a nenhuma área.

    Como o material faz com o merge do pandas: junção à esquerda e, depois, só as linhas em que
    o indicador de par ficou vazio, isto é, os pontos que não encontraram área.
    """
    juncao = gpd.sjoin(pontos, areas, how="left", predicate=PREDICADO_INTERIOR)
    sem_par = juncao.index[juncao["index_right"].isna()]
    return pontos.loc[sem_par.unique()]


def iguais(a: BaseGeometry, b: BaseGeometry) -> bool:
    """Igualdade, §4.1, eq. (9): A = B ⟺ ∀x (x ∈ A ↔ x ∈ B).

    Compara os pontos, não a escrita: a ordem dos vértices não importa, como {a, b} = {b, a}.
    """
    return a.equals(b)


def subconjunto(a: BaseGeometry, b: BaseGeometry) -> bool:
    """Inclusão, §4.2, eq. (10): A ⊆ B ⟺ ∀x (x ∈ A → x ∈ B)."""
    return b.covers(a)


def subconjunto_proprio(a: BaseGeometry, b: BaseGeometry) -> bool:
    """Inclusão própria, §4.2, eq. (11): A ⊂ B ⟺ A ⊆ B ∧ A ≠ B."""
    return subconjunto(a, b) and not iguais(a, b)


def disjuntos(a: BaseGeometry, b: BaseGeometry) -> bool:
    """A ∩ B = ∅: nenhum ponto em comum, nem mesmo na borda."""
    return a.disjoint(b)


def uniao(a: gpd.GeoDataFrame, b: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """União, §4.4, eq. (13): x ∈ A ∪ B ⟺ x ∈ A ∨ x ∈ B.

    O overlay devolve as regiões do diagrama de Venn: só A, só B e A ∩ B.
    """
    return gpd.overlay(a, b, how="union", keep_geom_type=True)


def interseccao(a: gpd.GeoDataFrame, b: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Intersecção, §4.5, eq. (14): x ∈ A ∩ B ⟺ x ∈ A ∧ x ∈ B."""
    return gpd.overlay(a, b, how="intersection", keep_geom_type=True)


def diferenca(a: gpd.GeoDataFrame, b: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Diferença, §4.6, eq. (15): x ∈ A − B ⟺ x ∈ A ∧ x ∉ B."""
    return gpd.overlay(a, b, how="difference", keep_geom_type=True)


def diferenca_simetrica(a: gpd.GeoDataFrame, b: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Diferença simétrica, Figura 21(b): (A − B) ∪ (B − A)."""
    return gpd.overlay(a, b, how="symmetric_difference", keep_geom_type=True)


def produto(e: gpd.GeoDataFrame, a: gpd.GeoDataFrame) -> pd.DataFrame:
    """Produto cartesiano, §4.7, eq. (16): E × A = {(e, a) | e ∈ E ∧ a ∈ A}.

    Como no material, o merge do pandas com how="cross" forma todos os |E|·|A| pares.
    """
    return pd.DataFrame(e).merge(pd.DataFrame(a), how="cross", suffixes=("_e", "_a"))


def juncao_pelo_produto(e: gpd.GeoDataFrame, a: gpd.GeoDataFrame) -> pd.DataFrame:
    """A junção espacial como seleção sobre o produto: {(e, a) ∈ E × A | e ∈ a}.

    Aqui os |E|·|A| pares são testados um a um. O sjoin de `pertence` chega ao mesmo resultado
    consultando um índice espacial, que descarta de antemão os pares impossíveis.
    """
    pares = produto(e, a)
    ponto = gpd.GeoSeries(pares[f"{e.geometry.name}_e"])
    area = gpd.GeoSeries(pares[f"{a.geometry.name}_a"])
    return pares[ponto.within(area).to_numpy()]
