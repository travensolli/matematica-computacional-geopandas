"""Operações do laboratório entre duas áreas do exemplo sintético."""

import pytest

from zoneamento.dominio.erros import ErroValidacao, NaoEncontrado
from zoneamento.geo.operacoes import OPERACOES, operar, relacoes, resumo_produto

A, C, D = 1, 3, 4


def test_uniao_reune_os_elementos_das_duas_areas(areas_sinteticas, estabelecimentos_sinteticos):
    r = operar(areas_sinteticas, estabelecimentos_sinteticos, A, D, "uniao")
    assert r["a"]["id"] == A
    assert r["b"]["id"] == D
    assert not r["vazio"]
    assert r["geometria"]["type"] in {"Polygon", "MultiPolygon"}
    assert r["estabelecimentos"] == [1, 2, 3, 4, 5]


def test_diferenca_mais_interseccao_e_a_propria_area(areas_sinteticas, estabelecimentos_sinteticos):
    def area(op):
        return operar(areas_sinteticas, estabelecimentos_sinteticos, A, D, op)["area_km2"]

    inteira = operar(areas_sinteticas, estabelecimentos_sinteticos, A, A, "uniao")["area_km2"]
    assert area("diferenca") + area("interseccao") == pytest.approx(inteira, abs=2e-3)
    assert area("diferenca_simetrica") == pytest.approx(
        area("diferenca") + area("diferenca_inversa"), abs=2e-3
    )


def test_interseccao_vazia(areas_sinteticas, estabelecimentos_sinteticos):
    r = operar(areas_sinteticas, estabelecimentos_sinteticos, A, C, "interseccao")
    assert r["vazio"] is True
    assert r["geometria"] is None
    assert r["area_km2"] == 0.0
    assert r["estabelecimentos"] == []


def test_operacao_e_area_invalidas(areas_sinteticas, estabelecimentos_sinteticos):
    with pytest.raises(ErroValidacao, match="Operação desconhecida"):
        operar(areas_sinteticas, estabelecimentos_sinteticos, A, D, "potencia")
    with pytest.raises(NaoEncontrado):
        operar(areas_sinteticas, estabelecimentos_sinteticos, A, 999, "uniao")
    assert set(OPERACOES) == {
        "uniao",
        "interseccao",
        "diferenca",
        "diferenca_inversa",
        "diferenca_simetrica",
    }


def test_relacoes(areas_sinteticas):
    ad = relacoes(areas_sinteticas, A, D)
    assert not ad["iguais"]
    assert not ad["disjuntos"]
    assert not ad["a_subconjunto_b"]
    assert not ad["b_subconjunto_a"]
    aa = relacoes(areas_sinteticas, A, A)
    assert aa["iguais"]
    assert aa["a_subconjunto_b"]
    assert not aa["a_subconjunto_proprio_b"]
    assert relacoes(areas_sinteticas, A, C)["disjuntos"]


def test_resumo_do_produto_cartesiano(areas_sinteticas, estabelecimentos_sinteticos):
    r = resumo_produto(estabelecimentos_sinteticos, areas_sinteticas, amostra=5)
    assert (r["estabelecimentos"], r["areas"], r["pares"]) == (9, 4, 36)
    # Nove estabelecimentos, e a metalúrgica conta duas vezes (está em B e em D).
    assert r["pares_com_pertinencia"] == 10
    assert r["fora_de_todas"] == []
    assert len(r["amostra"]) == 5
    assert r["amostra"][0] == {
        "estabelecimento": "Escola municipal (exemplo)",
        "area": "Área A: núcleo central",
        "pertence": True,
    }


def test_resumo_sem_areas(estabelecimentos_sinteticos, areas_sinteticas):
    r = resumo_produto(estabelecimentos_sinteticos, areas_sinteticas.iloc[0:0])
    assert r["pares"] == 0
    assert r["fora_de_todas"] == list(range(1, 10))
