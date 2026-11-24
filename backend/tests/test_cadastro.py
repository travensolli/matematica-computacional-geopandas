"""Casos de uso do cadastro sobre o repositório GeoPandas."""

import pytest

from zoneamento.dominio.erros import ErroValidacao, NaoEncontrado
from zoneamento.repositorio.camadas import RepositorioGeo
from zoneamento.servicos import cadastro

QUADRADO = {
    "type": "Polygon",
    "coordinates": [
        [[-45.97, -23.31], [-45.96, -23.31], [-45.96, -23.30], [-45.97, -23.30], [-45.97, -23.31]]
    ],
}
# O mesmo conjunto de pontos, escrito a partir de outro vértice e no sentido oposto.
QUADRADO_REESCRITO = {
    "type": "Polygon",
    "coordinates": [
        [[-45.96, -23.30], [-45.96, -23.31], [-45.97, -23.31], [-45.97, -23.30], [-45.96, -23.30]]
    ],
}
OUTRO = {
    "type": "Polygon",
    "coordinates": [
        [[-45.95, -23.31], [-45.94, -23.31], [-45.94, -23.30], [-45.95, -23.30], [-45.95, -23.31]]
    ],
}


@pytest.fixture
def repo(tmp_path):
    return RepositorioGeo(tmp_path)


def test_cadastrar_area(repo):
    registro = cadastro.cadastrar_area(repo, " Jardim Santa Maria ", QUADRADO)
    assert registro["nome"] == "Jardim Santa Maria"
    assert registro["fonte"] == "cadastro"
    assert len(repo.areas()) == 1


def test_area_igual_a_outra_e_recusada(repo):
    cadastro.cadastrar_area(repo, "A", QUADRADO)
    with pytest.raises(ErroValidacao, match="Já existe uma área com exatamente esses limites: A"):
        cadastro.cadastrar_area(repo, "B", QUADRADO_REESCRITO)


def test_editar_area(repo):
    cadastro.cadastrar_area(repo, "A", QUADRADO)
    cadastro.cadastrar_area(repo, "B", OUTRO)
    assert cadastro.editar_area(repo, 1, nome="A renomeada")["nome"] == "A renomeada"
    # Redesenhar A igual a ela mesma é permitido; igual a B, não.
    cadastro.editar_area(repo, 1, geometria=QUADRADO_REESCRITO)
    with pytest.raises(ErroValidacao, match="exatamente esses limites: B"):
        cadastro.editar_area(repo, 1, geometria=OUTRO)
    with pytest.raises(ErroValidacao, match="Informe o nome ou a geometria"):
        cadastro.editar_area(repo, 1)
    with pytest.raises(NaoEncontrado):
        cadastro.editar_area(repo, 99, geometria=OUTRO)


def test_excluir_area(repo):
    cadastro.cadastrar_area(repo, "A", QUADRADO)
    cadastro.excluir_area(repo, 1)
    assert repo.areas().empty


def test_estabelecimento(repo):
    e = cadastro.cadastrar_estabelecimento(repo, "Fatec Jacareí", "escola", -23.29521, -45.96692)
    assert (e["tipo"], e["fonte"]) == ("escola", "cadastro")
    assert (e["geometry"].x, e["geometry"].y) == (-45.96692, -23.29521)

    movido = cadastro.editar_estabelecimento(repo, e["id"], tipo="industria", lat=-23.3, lng=-45.9)
    assert movido["tipo"] == "industria"
    assert (movido["geometry"].x, movido["geometry"].y) == (-45.9, -23.3)
    assert cadastro.editar_estabelecimento(repo, e["id"], nome="Outro nome")["nome"] == "Outro nome"

    with pytest.raises(ErroValidacao, match="Informe o nome, o tipo ou a posição"):
        cadastro.editar_estabelecimento(repo, e["id"])
    with pytest.raises(ErroValidacao):
        cadastro.cadastrar_estabelecimento(repo, "x", "fabrica", -23.3, -45.9)

    cadastro.excluir_estabelecimento(repo, e["id"])
    assert repo.estabelecimentos().empty


def test_coordenadas_ficam_na_grade_gravada(repo):
    e = cadastro.cadastrar_estabelecimento(repo, "x", "escola", -23.295211111111, -45.966922222222)
    assert (e["geometry"].x, e["geometry"].y) == pytest.approx(
        (-45.9669222, -23.2952111), abs=1e-12
    )
