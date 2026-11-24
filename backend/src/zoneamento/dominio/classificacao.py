"""Regra de classificação das áreas, escrita com operações de conjuntos.

Para uma área a, seja T(a) o conjunto dos tipos dos estabelecimentos no interior de a:

    a é escolar          ⟺  escola ∈ T(a)
    a é industrial       ⟺  indústria ∈ T(a)
    a é residencial      ⟺  T(a) ≠ ∅  ∧  T(a) ⊆ {residência}
    a sem classificação  ⟺  T(a) = ∅

As duas primeiras são pertinência (eq. 1 das notas de aula); a terceira é inclusão (eq. 10) e
traduz o "contendo somente residências" do enunciado. Uma área pode ser escolar e industrial ao
mesmo tempo; residencial nunca se combina com as outras.
"""

from collections.abc import Iterable, Set
from itertools import chain, combinations

from zoneamento.dominio.tipos import ORDEM_CLASSES, TIPOS, Classe, TipoEstabelecimento

_RESIDENCIA = frozenset({TipoEstabelecimento.RESIDENCIA})


def classes_da_area(tipos_presentes: Iterable[TipoEstabelecimento | str]) -> frozenset[Classe]:
    """Classes de uma área a partir de T(a), o conjunto de tipos que ela contém."""
    t = frozenset(TipoEstabelecimento(tipo) for tipo in tipos_presentes)
    classes: set[Classe] = set()
    if TipoEstabelecimento.ESCOLA in t:
        classes.add(Classe.ESCOLAR)
    if TipoEstabelecimento.INDUSTRIA in t:
        classes.add(Classe.INDUSTRIAL)
    if t and t <= _RESIDENCIA:
        classes.add(Classe.RESIDENCIAL)
    return frozenset(classes)


def classes_do_ponto(classes_por_area: Iterable[Iterable[Classe | str]]) -> frozenset[Classe]:
    """União (eq. 13) das classes de todas as áreas que contêm o ponto."""
    return frozenset(Classe(c) for c in chain.from_iterable(classes_por_area))


def ordenar_classes(classes: Iterable[Classe | str]) -> list[Classe]:
    """Classes na ordem de exibição: escolar, industrial, residencial."""
    presentes = {Classe(c) for c in classes}
    return [c for c in ORDEM_CLASSES if c in presentes]


def descrever(classes: Iterable[Classe | str]) -> str:
    """Texto curto para o veredito: "Área escolar e industrial", "Sem classificação"."""
    nomes = [c.value for c in ordenar_classes(classes)]
    if not nomes:
        return "Sem classificação"
    return "Área " + " e ".join(nomes)


def conjunto_das_partes[T](conjunto: Set[T]) -> list[frozenset[T]]:
    """P(X), eq. (12): todos os subconjuntos de X, do vazio ao próprio X. |P(X)| = 2^|X|."""
    itens = sorted(conjunto)
    return [frozenset(escolha) for r in range(len(itens) + 1) for escolha in combinations(itens, r)]


def tabela_das_partes() -> list[tuple[frozenset[TipoEstabelecimento], frozenset[Classe]]]:
    """Cada subconjunto de T e a classificação que ele produz: 8 linhas, 5 resultados distintos."""
    return [(tipos, classes_da_area(tipos)) for tipos in conjunto_das_partes(TIPOS)]
