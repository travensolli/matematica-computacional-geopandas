"""Cadastro de estabelecimentos: escolas, indústrias e residências."""

from flask import Blueprint

from zoneamento.api.contexto import repositorio
from zoneamento.api.esquemas import EdicaoEstabelecimento, NovoEstabelecimento, corpo
from zoneamento.api.serializacao import colecao, linha_como_feature
from zoneamento.servicos import cadastro

bp = Blueprint("estabelecimentos", __name__, url_prefix="/api/estabelecimentos")


@bp.get("")
def listar():
    return colecao(repositorio().estabelecimentos())


@bp.post("")
def criar():
    d = corpo(NovoEstabelecimento)
    registro = cadastro.cadastrar_estabelecimento(repositorio(), d.nome, d.tipo, d.lat, d.lng)
    return linha_como_feature(repositorio().estabelecimentos(), registro["id"]), 201


@bp.patch("/<int:estabelecimento_id>")
def editar(estabelecimento_id: int):
    d = corpo(EdicaoEstabelecimento)
    cadastro.editar_estabelecimento(repositorio(), estabelecimento_id, d.nome, d.tipo, d.lat, d.lng)
    return linha_como_feature(repositorio().estabelecimentos(), estabelecimento_id)


@bp.delete("/<int:estabelecimento_id>")
def excluir(estabelecimento_id: int):
    cadastro.excluir_estabelecimento(repositorio(), estabelecimento_id)
    return "", 204
