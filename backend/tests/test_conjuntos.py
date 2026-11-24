"""Operações de conjuntos sobre geometrias com áreas conhecidas."""

import pytest
from shapely.geometry import Polygon, box

from zoneamento.geo import conjuntos


def _area(gdf) -> float:
    return float(gdf.geometry.area.sum())


def test_pertence_usa_o_interior(pontos, areas_ab):
    pares = conjuntos.pertence(pontos, areas_ab)
    obtido = sorted(zip(pares["nome_left"], pares["nome_right"], strict=True))
    # p2 está em A ∩ B, p4 está fora e p5, sobre a borda de A, não está no interior.
    assert obtido == [("p1", "A"), ("p2", "A"), ("p2", "B"), ("p3", "B")]


def test_fora_de_todas_e_a_diferenca(pontos, areas_ab):
    fora = conjuntos.fora_de_todas(pontos, areas_ab)
    assert sorted(fora["nome"]) == ["p4", "p5"]


def test_igualdade_ignora_a_ordem_dos_vertices():
    a = Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])
    b = Polygon([(1, 1), (0, 1), (0, 0), (1, 0)])
    assert conjuntos.iguais(a, b)
    assert not conjuntos.iguais(a, box(0, 0, 2, 1))


def test_subconjunto_e_subconjunto_proprio():
    grande, pequeno = box(0, 0, 4, 4), box(1, 1, 2, 2)
    assert conjuntos.subconjunto(pequeno, grande)
    assert conjuntos.subconjunto_proprio(pequeno, grande)
    assert not conjuntos.subconjunto(grande, pequeno)
    # Todo conjunto é subconjunto de si mesmo, mas não subconjunto próprio.
    assert conjuntos.subconjunto(grande, grande)
    assert not conjuntos.subconjunto_proprio(grande, grande)


def test_disjuntos():
    assert conjuntos.disjuntos(box(0, 0, 1, 1), box(2, 2, 3, 3))
    # Encostar na borda já é ter pontos em comum.
    assert not conjuntos.disjuntos(box(0, 0, 1, 1), box(1, 0, 2, 1))


def test_operacoes_de_overlay(quadrado_a, quadrado_b):
    assert _area(conjuntos.uniao(quadrado_a, quadrado_b)) == pytest.approx(6)
    assert _area(conjuntos.interseccao(quadrado_a, quadrado_b)) == pytest.approx(2)
    assert _area(conjuntos.diferenca(quadrado_a, quadrado_b)) == pytest.approx(2)
    assert _area(conjuntos.diferenca(quadrado_b, quadrado_a)) == pytest.approx(2)
    assert _area(conjuntos.diferenca_simetrica(quadrado_a, quadrado_b)) == pytest.approx(4)


def test_uniao_devolve_as_tres_regioes_do_venn(quadrado_a, quadrado_b):
    regioes = conjuntos.uniao(quadrado_a, quadrado_b)
    assert len(regioes) == 3
    so_a = regioes[regioes["nome_2"].isna()]
    so_b = regioes[regioes["nome_1"].isna()]
    comum = regioes[regioes["nome_1"].notna() & regioes["nome_2"].notna()]
    assert [_area(so_a), _area(so_b), _area(comum)] == pytest.approx([2, 2, 2])


def test_inclusao_exclusao(quadrado_a, quadrado_b):
    """|A ∪ B| = |A| + |B| − |A ∩ B|, com área no lugar da cardinalidade."""
    uniao = _area(conjuntos.uniao(quadrado_a, quadrado_b))
    inter = _area(conjuntos.interseccao(quadrado_a, quadrado_b))
    assert uniao == pytest.approx(_area(quadrado_a) + _area(quadrado_b) - inter)


def test_diferenca_simetrica_e_uniao_das_diferencas(quadrado_a, quadrado_b):
    simetrica = conjuntos.diferenca_simetrica(quadrado_a, quadrado_b).geometry.union_all()
    a_menos_b = conjuntos.diferenca(quadrado_a, quadrado_b).geometry.union_all()
    b_menos_a = conjuntos.diferenca(quadrado_b, quadrado_a).geometry.union_all()
    assert conjuntos.iguais(simetrica, a_menos_b.union(b_menos_a))


def test_produto_tem_todos_os_pares(pontos, areas_ab):
    pares = conjuntos.produto(pontos, areas_ab)
    assert len(pares) == len(pontos) * len(areas_ab)
    assert {"nome_e", "nome_a", "geometry_e", "geometry_a"} <= set(pares.columns)


def test_juncao_pelo_produto_coincide_com_o_sjoin(pontos, areas_ab):
    pelo_produto = conjuntos.juncao_pelo_produto(pontos, areas_ab)
    pelo_sjoin = conjuntos.pertence(pontos, areas_ab)
    assert sorted(zip(pelo_produto["nome_e"], pelo_produto["nome_a"], strict=True)) == sorted(
        zip(pelo_sjoin["nome_left"], pelo_sjoin["nome_right"], strict=True)
    )
