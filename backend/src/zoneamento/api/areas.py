"""Cadastro de áreas: listagem já classificada, criação, edição e exclusão."""

from flask import Blueprint

from zoneamento.api.contexto import areas_classificadas, repositorio
from zoneamento.api.esquemas import EdicaoArea, NovaArea, corpo
from zoneamento.api.serializacao import colecao, linha_como_feature
from zoneamento.servicos import cadastro

bp = Blueprint("areas", __name__, url_prefix="/api/areas")


@bp.get("")
def listar():
    return colecao(areas_classificadas())


@bp.post("")
def criar():
    dados = corpo(NovaArea)
    registro = cadastro.cadastrar_area(repositorio(), dados.nome, dados.geometry)
    return linha_como_feature(areas_classificadas(), registro["id"]), 201


@bp.patch("/<int:area_id>")
def editar(area_id: int):
    dados = corpo(EdicaoArea)
    cadastro.editar_area(repositorio(), area_id, dados.nome, dados.geometry)
    return linha_como_feature(areas_classificadas(), area_id)


@bp.delete("/<int:area_id>")
def excluir(area_id: int):
    cadastro.excluir_area(repositorio(), area_id)
    return "", 204
