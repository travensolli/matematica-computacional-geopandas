"""Casos de uso do cadastro: validam a entrada e gravam pelo repositório GeoPandas."""

from typing import Any

import shapely
from shapely.geometry import Polygon

from zoneamento.dominio.erros import ErroValidacao
from zoneamento.geo import conjuntos
from zoneamento.geo.validacao import validar_nome, validar_poligono, validar_ponto, validar_tipo
from zoneamento.repositorio.camadas import CASAS_DECIMAIS, RepositorioGeo

#: Grade das coordenadas gravadas, a mesma do arquivo GeoJSON.
GRADE = 10.0**-CASAS_DECIMAIS
#: Origem dos registros criados pela interface.
FONTE_CADASTRO = "cadastro"


def _na_grade(geometria: Any) -> Any:
    """Arredonda as coordenadas para a precisão gravada, antes de comparar e de gravar."""
    return shapely.set_precision(geometria, GRADE)


def _recusar_area_igual(repo: RepositorioGeo, poligono: Polygon, ignorar: int | None) -> None:
    """Igualdade de conjuntos, eq. (9): duas áreas com exatamente os mesmos pontos não."""
    areas = repo.areas()
    for area_id, nome, geometria in zip(areas["id"], areas["nome"], areas.geometry, strict=True):
        if area_id != ignorar and conjuntos.iguais(geometria, poligono):
            raise ErroValidacao(
                f"Já existe uma área com exatamente esses limites: {nome}.", "geometry"
            )


def cadastrar_area(repo: RepositorioGeo, nome: Any, geometria: Any) -> dict:
    nome_valido = validar_nome(nome)
    poligono = _na_grade(validar_poligono(geometria))
    _recusar_area_igual(repo, poligono, ignorar=None)
    return repo.inserir("areas", {"nome": nome_valido, "fonte": FONTE_CADASTRO}, poligono)


def editar_area(
    repo: RepositorioGeo, area_id: int, nome: Any = None, geometria: Any = None
) -> dict:
    atributos = {} if nome is None else {"nome": validar_nome(nome)}
    poligono = None if geometria is None else _na_grade(validar_poligono(geometria))
    if not atributos and poligono is None:
        raise ErroValidacao("Informe o nome ou a geometria a alterar.")
    repo.obter("areas", area_id)  # id inexistente falha antes de comparar geometrias
    if poligono is not None:
        _recusar_area_igual(repo, poligono, ignorar=area_id)
    return repo.atualizar("areas", area_id, atributos, poligono)


def excluir_area(repo: RepositorioGeo, area_id: int) -> None:
    repo.remover("areas", area_id)


def cadastrar_estabelecimento(
    repo: RepositorioGeo, nome: Any, tipo: Any, lat: Any, lng: Any
) -> dict:
    atributos = {
        "nome": validar_nome(nome),
        "tipo": validar_tipo(tipo).value,
        "fonte": FONTE_CADASTRO,
    }
    return repo.inserir("estabelecimentos", atributos, _na_grade(validar_ponto(lat, lng)))


def editar_estabelecimento(
    repo: RepositorioGeo,
    estabelecimento_id: int,
    nome: Any = None,
    tipo: Any = None,
    lat: Any = None,
    lng: Any = None,
) -> dict:
    atributos: dict[str, Any] = {}
    if nome is not None:
        atributos["nome"] = validar_nome(nome)
    if tipo is not None:
        atributos["tipo"] = validar_tipo(tipo).value
    ponto = None
    if lat is not None or lng is not None:
        ponto = _na_grade(validar_ponto(lat, lng))
    if not atributos and ponto is None:
        raise ErroValidacao("Informe o nome, o tipo ou a posição a alterar.")
    return repo.atualizar("estabelecimentos", estabelecimento_id, atributos, ponto)


def excluir_estabelecimento(repo: RepositorioGeo, estabelecimento_id: int) -> None:
    repo.remover("estabelecimentos", estabelecimento_id)
