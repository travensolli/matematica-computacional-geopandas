"""Tradução dos erros em respostas JSON: {erro, campo, detalhes}."""

from typing import Any

from flask import Flask, jsonify, request
from pydantic import ValidationError
from werkzeug.exceptions import HTTPException

from zoneamento.dominio.erros import ErroValidacao, NaoEncontrado

#: Mensagens em português para os tipos de erro mais comuns do pydantic.
MENSAGENS_PYDANTIC = {
    "missing": "Campo obrigatório.",
    "string_type": "Deve ser um texto.",
    "float_parsing": "Deve ser um número.",
    "float_type": "Deve ser um número.",
    "finite_number": "Deve ser um número finito.",
    "int_parsing": "Deve ser um número inteiro.",
    "int_type": "Deve ser um número inteiro.",
    "int_from_float": "Deve ser um número inteiro.",
    "dict_type": "Deve ser um objeto JSON.",
    "model_type": "Deve ser um objeto JSON.",
    "extra_forbidden": "Campo não reconhecido.",
}


def resposta_erro(
    mensagem: str, status: int, campo: str | None = None, detalhes: list[dict] | None = None
) -> tuple[Any, int]:
    return jsonify(erro=mensagem, campo=campo, detalhes=detalhes or []), status


def _detalhes(erro: ValidationError) -> list[dict[str, str]]:
    return [
        {
            "campo": ".".join(str(parte) for parte in item["loc"]),
            "mensagem": MENSAGENS_PYDANTIC.get(item["type"], "Valor inválido."),
        }
        for item in erro.errors()
    ]


def registrar_erros(app: Flask) -> None:
    @app.errorhandler(ErroValidacao)
    def _validacao(erro: ErroValidacao):
        return resposta_erro(erro.mensagem, 422, erro.campo)

    @app.errorhandler(ValidationError)
    def _pydantic(erro: ValidationError):
        detalhes = _detalhes(erro)
        primeiro = detalhes[0]
        return resposta_erro(
            f"{primeiro['campo']}: {primeiro['mensagem']}", 422, primeiro["campo"], detalhes
        )

    @app.errorhandler(NaoEncontrado)
    def _nao_encontrado(erro: NaoEncontrado):
        return resposta_erro(str(erro), 404)

    @app.errorhandler(HTTPException)
    def _http(erro: HTTPException):
        if not request.path.startswith("/api/"):
            return erro
        mensagens = {
            400: "Requisição inválida.",
            404: "Rota não encontrada.",
            405: "Método não permitido nesta rota.",
            415: "Envie o corpo em JSON.",
        }
        status = erro.code or 500
        return resposta_erro(mensagens.get(status, erro.description or "Erro."), status)
