"""O repositório GeoPandas: persistência em GeoJSON, ids, semente e concorrência."""

import json
import threading

import pytest
from shapely.geometry import Point, box

from zoneamento.dominio.erros import NaoEncontrado
from zoneamento.repositorio.camadas import RepositorioGeo

QUADRADO = box(-45.97, -23.31, -45.96, -23.30)


def test_comeca_vazio_sem_semente(tmp_path):
    repo = RepositorioGeo(tmp_path / "dados")
    assert repo.areas().empty
    assert list(repo.areas().columns) == ["id", "nome", "fonte", "criado_em", "geometry"]
    assert repo.estabelecimentos().empty
    assert repo.municipio() is None


def test_copia_a_semente_e_numera_os_registros(tmp_path, semente):
    repo = RepositorioGeo(tmp_path / "dados", semente)
    assert repo.areas()["id"].tolist() == [1, 2, 3, 4]
    assert repo.estabelecimentos()["id"].tolist() == list(range(1, 10))
    assert repo.municipio()["codarea"].tolist() == ["3524402"]
    assert (tmp_path / "dados" / "areas.geojson").exists()


def test_insercao_persiste_e_volta_igual(tmp_path):
    repo = RepositorioGeo(tmp_path)
    registro = repo.inserir("areas", {"nome": "Jardim Santa Maria"}, QUADRADO)
    assert registro["id"] == 1

    relido = RepositorioGeo(tmp_path).areas()
    assert relido["nome"].tolist() == ["Jardim Santa Maria"]
    assert relido.geometry.iloc[0].equals(QUADRADO)
    assert relido["criado_em"].iloc[0] == registro["criado_em"]


def test_ids_seguem_o_maior_existente(tmp_path):
    repo = RepositorioGeo(tmp_path)
    for nome in ["a", "b", "c"]:
        repo.inserir("estabelecimentos", {"nome": nome, "tipo": "escola"}, Point(-45.9, -23.3))
    repo.remover("estabelecimentos", 2)
    novo = repo.inserir("estabelecimentos", {"nome": "d", "tipo": "escola"}, Point(-45.9, -23.3))
    assert novo["id"] == 4
    assert repo.estabelecimentos()["id"].tolist() == [1, 3, 4]


def test_atualizar_e_remover(tmp_path):
    repo = RepositorioGeo(tmp_path)
    repo.inserir("areas", {"nome": "antiga"}, QUADRADO)
    maior = box(-45.98, -23.32, -45.95, -23.29)
    atualizado = repo.atualizar("areas", 1, {"nome": "nova"}, maior)
    assert atualizado["nome"] == "nova"
    assert RepositorioGeo(tmp_path).areas().geometry.iloc[0].equals(maior)
    repo.remover("areas", 1)
    assert RepositorioGeo(tmp_path).areas().empty


@pytest.mark.parametrize("acao", ["obter", "atualizar", "remover"])
def test_registro_inexistente(tmp_path, acao):
    repo = RepositorioGeo(tmp_path)
    chamadas = {
        "obter": lambda: repo.obter("areas", 7),
        "atualizar": lambda: repo.atualizar("areas", 7, {"nome": "x"}),
        "remover": lambda: repo.remover("areas", 7),
    }
    with pytest.raises(NaoEncontrado):
        chamadas[acao]()


def test_gravacao_atomica_e_com_sete_casas(tmp_path):
    repo = RepositorioGeo(tmp_path)
    repo.inserir("estabelecimentos", {"nome": "x", "tipo": "escola"}, Point(-45.96692111, -23.2952))
    assert sorted(p.name for p in tmp_path.iterdir()) == ["estabelecimentos.geojson"]
    conteudo = json.loads((tmp_path / "estabelecimentos.geojson").read_text(encoding="utf-8"))
    assert conteudo["features"][0]["geometry"]["coordinates"] == [-45.9669211, -23.2952]


def test_leituras_devolvem_copias(tmp_path):
    repo = RepositorioGeo(tmp_path)
    repo.inserir("areas", {"nome": "a"}, QUADRADO)
    copia = repo.areas()
    copia.loc[0, "nome"] = "alterado por fora"
    assert repo.areas()["nome"].iloc[0] == "a"


def test_insercoes_concorrentes_tem_ids_unicos(tmp_path):
    repo = RepositorioGeo(tmp_path)

    def inserir(i):
        repo.inserir(
            "estabelecimentos", {"nome": f"e{i}", "tipo": "residencia"}, Point(-45.9, -23.3)
        )

    threads = [threading.Thread(target=inserir, args=(i,)) for i in range(20)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    ids = RepositorioGeo(tmp_path).estabelecimentos()["id"].tolist()
    assert sorted(ids) == list(range(1, 21))


def test_restaurar_volta_a_semente(tmp_path, semente):
    repo = RepositorioGeo(tmp_path / "dados", semente)
    repo.remover("areas", 1)
    repo.inserir("areas", {"nome": "extra"}, QUADRADO)
    repo.restaurar()
    assert repo.areas()["id"].tolist() == [1, 2, 3, 4]
    with pytest.raises(RuntimeError):
        RepositorioGeo(tmp_path / "sem-semente").restaurar()


def test_nao_sobrescreve_dados_existentes_com_a_semente(tmp_path, semente):
    RepositorioGeo(tmp_path / "dados", semente).remover("areas", 1)
    assert RepositorioGeo(tmp_path / "dados", semente).areas()["id"].tolist() == [2, 3, 4]
