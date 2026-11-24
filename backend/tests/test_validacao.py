"""Validações do cadastro: mensagens claras e o campo de origem do erro."""

import pytest

from zoneamento.dominio.erros import ErroValidacao
from zoneamento.dominio.tipos import TipoEstabelecimento
from zoneamento.geo import validacao

QUADRADO = {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]}
GRAVATA = {"type": "Polygon", "coordinates": [[[0, 0], [1, 1], [1, 0], [0, 1], [0, 0]]]}


def test_nome_e_aparado():
    assert validacao.validar_nome("  Jardim Santa Maria ") == "Jardim Santa Maria"


@pytest.mark.parametrize("nome", [None, "", "   ", 42, "x" * 121])
def test_nome_invalido(nome):
    with pytest.raises(ErroValidacao) as erro:
        validacao.validar_nome(nome)
    assert erro.value.campo == "nome"


def test_tipo():
    assert validacao.validar_tipo("escola") is TipoEstabelecimento.ESCOLA
    with pytest.raises(ErroValidacao, match="escola, industria ou residencia"):
        validacao.validar_tipo("fabrica")


def test_coordenada_aceita_texto_numerico():
    assert validacao.validar_coordenada("-23.29521", "-45.96692") == (-23.29521, -45.96692)


@pytest.mark.parametrize(
    ("lat", "lng", "campo"),
    [("a", 0, "lat"), (None, 0, "lat"), (91, 0, "lat"), (0, -181, "lng"), ("nan", 0, "lat")],
)
def test_coordenada_invalida(lat, lng, campo):
    with pytest.raises(ErroValidacao) as erro:
        validacao.validar_coordenada(lat, lng)
    assert erro.value.campo == campo


def test_ponto_usa_x_como_longitude():
    ponto = validacao.validar_ponto(-23.3, -45.9)
    assert (ponto.x, ponto.y) == (-45.9, -23.3)


def test_poligono_valido():
    assert validacao.validar_poligono(QUADRADO).area == 1


def test_poligono_com_arestas_cruzadas():
    with pytest.raises(ErroValidacao, match="as arestas do polígono se cruzam"):
        validacao.validar_poligono(GRAVATA)


@pytest.mark.parametrize(
    ("aneis", "trecho"),
    [
        ([[[0, 0], [1, 0], [2, 0], [0, 0]]], "se cruzam"),
        ([[[0, 0], [2, 0], [2, 2], [1, 0], [0, 2], [0, 0]]], "passa duas vezes"),
        (
            [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]], [[5, 5], [6, 5], [6, 6], [5, 6], [5, 5]]],
            "buraco do polígono fica fora",
        ),
    ],
)
def test_motivos_de_invalidez_em_portugues(aneis, trecho):
    with pytest.raises(ErroValidacao, match=trecho) as erro:
        validacao.validar_poligono({"type": "Polygon", "coordinates": aneis})
    assert "[" not in erro.value.mensagem


@pytest.mark.parametrize(
    ("geometria", "trecho"),
    [
        (None, "GeoJSON"),
        ({"type": "Polygon", "coordinates": "x"}, "formato GeoJSON inválido"),
        ({"type": "Point", "coordinates": [0, 0]}, "deve ser um polígono"),
        (
            {"type": "Polygon", "coordinates": [[[0, 0], [1, 1], [0, 0], [0, 0]]]},
            "três vértices",
        ),
        (
            {"type": "Polygon", "coordinates": [[[0, 0], [200, 0], [200, 1], [0, 0]]]},
            "fora do intervalo",
        ),
    ],
)
def test_poligono_recusado(geometria, trecho):
    with pytest.raises(ErroValidacao, match=trecho) as erro:
        validacao.validar_poligono(geometria)
    assert erro.value.campo == "geometry"
