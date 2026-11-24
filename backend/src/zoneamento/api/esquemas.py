"""Contrato de entrada da API, em pydantic.

O pydantic confere a estrutura (campos, tipos, campos a mais); as regras de negócio, como o
polígono válido ou o tipo de estabelecimento, ficam na validação do domínio.
"""

from typing import Any

from flask import request
from pydantic import BaseModel, ConfigDict

from zoneamento.dominio.erros import ErroValidacao


class _Entrada(BaseModel):
    model_config = ConfigDict(extra="forbid")


class NovaArea(_Entrada):
    nome: str
    geometry: dict[str, Any]


class EdicaoArea(_Entrada):
    nome: str | None = None
    geometry: dict[str, Any] | None = None


class NovoEstabelecimento(_Entrada):
    nome: str
    tipo: str
    lat: float
    lng: float


class EdicaoEstabelecimento(_Entrada):
    nome: str | None = None
    tipo: str | None = None
    lat: float | None = None
    lng: float | None = None


def corpo[M: BaseModel](modelo: type[M]) -> M:
    """Lê o corpo JSON da requisição e o valida contra o modelo."""
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        raise ErroValidacao("Envie um objeto JSON no corpo da requisição.")
    return modelo.model_validate(dados)


def inteiro(nome: str) -> int:
    """Parâmetro inteiro obrigatório da query string."""
    valor = request.args.get(nome)
    try:
        return int(valor)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        raise ErroValidacao(f"Informe o parâmetro {nome} como número inteiro.", nome) from None
