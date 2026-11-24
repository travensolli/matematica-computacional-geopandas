"""Tipos do domínio: os elementos (estabelecimentos) e as classes de área."""

from enum import StrEnum


class TipoEstabelecimento(StrEnum):
    """Tipo de um estabelecimento, o elemento que fica no interior das áreas."""

    ESCOLA = "escola"
    INDUSTRIA = "industria"
    RESIDENCIA = "residencia"


class Classe(StrEnum):
    """Classe de uma área, deduzida dos estabelecimentos que ela contém."""

    ESCOLAR = "escolar"
    INDUSTRIAL = "industrial"
    RESIDENCIAL = "residencial"


#: T, o conjunto de todos os tipos. Como |T| = 3, o conjunto das partes tem 2³ = 8 elementos.
TIPOS: frozenset[TipoEstabelecimento] = frozenset(TipoEstabelecimento)

#: Ordem em que as classes são exibidas.
ORDEM_CLASSES: tuple[Classe, ...] = (Classe.ESCOLAR, Classe.INDUSTRIAL, Classe.RESIDENCIAL)
