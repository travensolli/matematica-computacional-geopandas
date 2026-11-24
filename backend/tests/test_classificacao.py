"""A regra de classificação conferida sobre todo o conjunto das partes de T."""

import pytest

from zoneamento.dominio.classificacao import (
    classes_da_area,
    classes_do_ponto,
    conjunto_das_partes,
    descrever,
    ordenar_classes,
    tabela_das_partes,
)
from zoneamento.dominio.tipos import Classe, TipoEstabelecimento

ESCOLA = TipoEstabelecimento.ESCOLA
INDUSTRIA = TipoEstabelecimento.INDUSTRIA
RESIDENCIA = TipoEstabelecimento.RESIDENCIA
ESC, IND, RES = Classe.ESCOLAR, Classe.INDUSTRIAL, Classe.RESIDENCIAL

ESPERADO = {
    frozenset(): frozenset(),
    frozenset({ESCOLA}): frozenset({ESC}),
    frozenset({INDUSTRIA}): frozenset({IND}),
    frozenset({RESIDENCIA}): frozenset({RES}),
    frozenset({ESCOLA, INDUSTRIA}): frozenset({ESC, IND}),
    frozenset({ESCOLA, RESIDENCIA}): frozenset({ESC}),
    frozenset({INDUSTRIA, RESIDENCIA}): frozenset({IND}),
    frozenset({ESCOLA, INDUSTRIA, RESIDENCIA}): frozenset({ESC, IND}),
}


def test_tabela_cobre_os_oito_subconjuntos_de_t():
    tabela = dict(tabela_das_partes())
    assert len(tabela) == 2**3
    assert tabela == ESPERADO


def test_partes_produzem_cinco_classificacoes_distintas():
    resultados = {classes for _, classes in tabela_das_partes()}
    assert resultados == {
        frozenset(),
        frozenset({ESC}),
        frozenset({IND}),
        frozenset({RES}),
        frozenset({ESC, IND}),
    }


def test_residencial_e_disjunta_das_outras_classes():
    for _, classes in tabela_das_partes():
        if RES in classes:
            assert classes == {RES}


def test_aceita_valores_textuais_e_repetidos():
    assert classes_da_area(["residencia", "residencia"]) == {RES}
    assert classes_da_area(["escola", "residencia", "escola"]) == {ESC}


def test_tipo_desconhecido_e_recusado():
    with pytest.raises(ValueError, match="fabrica"):
        classes_da_area(["fabrica"])


@pytest.mark.parametrize("n", range(5))
def test_cardinalidade_do_conjunto_das_partes(n):
    partes = conjunto_das_partes(set(range(n)))
    assert len(partes) == 2**n
    assert len(set(partes)) == 2**n
    assert frozenset() in partes
    assert frozenset(range(n)) in partes


def test_classes_do_ponto_sao_a_uniao_das_classes_das_areas():
    assert classes_do_ponto([{ESC}, {IND}, set()]) == {ESC, IND}
    assert classes_do_ponto([]) == frozenset()


def test_ordenar_e_descrever():
    assert ordenar_classes({RES, IND, ESC}) == [ESC, IND, RES]
    assert descrever({IND, ESC}) == "Área escolar e industrial"
    assert descrever(["residencial"]) == "Área residencial"
    assert descrever([]) == "Sem classificação"
