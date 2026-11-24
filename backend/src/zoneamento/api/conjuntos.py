"""Operações de conjuntos entre áreas, para o laboratório da parte teórica."""

from flask import Blueprint, request

from zoneamento.api.contexto import repositorio
from zoneamento.api.esquemas import inteiro
from zoneamento.dominio.classificacao import ordenar_classes, tabela_das_partes
from zoneamento.dominio.tipos import TIPOS
from zoneamento.geo.operacoes import operar, relacoes, resumo_produto

bp = Blueprint("conjuntos", __name__, url_prefix="/api/conjuntos")


@bp.get("/operacao")
def operacao():
    repo = repositorio()
    return operar(
        repo.areas(),
        repo.estabelecimentos(),
        inteiro("a"),
        inteiro("b"),
        request.args.get("op", ""),
    )


@bp.get("/relacoes")
def relacoes_entre_areas():
    return relacoes(repositorio().areas(), inteiro("a"), inteiro("b"))


@bp.get("/produto")
def produto():
    repo = repositorio()
    return resumo_produto(repo.estabelecimentos(), repo.areas())


@bp.get("/partes")
def partes():
    """P(T) e a classificação de cada subconjunto, calculada pela regra real."""
    return {
        "tipos": sorted(t.value for t in TIPOS),
        "linhas": [
            {
                "tipos": sorted(t.value for t in tipos),
                "classes": [c.value for c in ordenar_classes(classes)],
            }
            for tipos, classes in tabela_das_partes()
        ],
    }
