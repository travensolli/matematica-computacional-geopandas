"""Código-fonte das funções que ligam a teoria ao sistema, para a página Teoria.

O frontend mostra este código como ele é: o trecho exibido é o mesmo que o servidor executa.
"""

import inspect
from collections.abc import Callable
from typing import Any

from flask import Blueprint

from zoneamento.dominio import classificacao
from zoneamento.geo import conjuntos

bp = Blueprint("teoria", __name__, url_prefix="/api/teoria")

FUNCOES: list[Callable[..., Any]] = [
    conjuntos.pertence,
    conjuntos.fora_de_todas,
    conjuntos.iguais,
    conjuntos.subconjunto,
    conjuntos.subconjunto_proprio,
    conjuntos.disjuntos,
    conjuntos.uniao,
    conjuntos.interseccao,
    conjuntos.diferenca,
    conjuntos.diferenca_simetrica,
    conjuntos.produto,
    conjuntos.juncao_pelo_produto,
    classificacao.classes_da_area,
    classificacao.classes_do_ponto,
    classificacao.conjunto_das_partes,
]


def _trecho(funcao: Callable[..., Any]) -> dict[str, Any]:
    linhas, inicio = inspect.getsourcelines(funcao)
    return {
        "nome": funcao.__name__,
        "arquivo": funcao.__module__.replace(".", "/") + ".py",
        "linha": inicio,
        "codigo": "".join(linhas),
    }


@bp.get("/trechos")
def trechos():
    return {"trechos": [_trecho(f) for f in FUNCOES]}
