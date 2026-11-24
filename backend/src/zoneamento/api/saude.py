"""Verificação de funcionamento, usada pelo Docker e pelos testes de ponta a ponta."""

from flask import Blueprint

from zoneamento.api.contexto import repositorio

bp = Blueprint("saude", __name__, url_prefix="/api")


@bp.get("/saude")
def saude():
    repo = repositorio()
    return {
        "status": "ok",
        "areas": len(repo.areas()),
        "estabelecimentos": len(repo.estabelecimentos()),
        "municipio": repo.municipio() is not None,
    }
