"""Rotas de cruzamento: consulta de ponto, sobreposições, município e conjuntos."""

from zoneamento import create_app
from zoneamento.config import Config

A, B, C, D = 1, 2, 3, 4


def test_consulta_de_ponto(cliente):
    r = cliente.get("/api/consulta?lat=-23.3040&lng=-45.9600").get_json()
    assert r["classes"] == ["escolar", "industrial"]
    assert [a["id"] for a in r["areas"]] == [A, D]
    assert cliente.get("/api/consulta?lat=abc&lng=1").status_code == 422


def test_sobreposicoes_e_municipio(cliente):
    sobre = cliente.get("/api/sobreposicoes").get_json()["features"]
    assert {(f["properties"]["id_1"], f["properties"]["id_2"]) for f in sobre} == {(A, D), (B, D)}
    u = cliente.get("/api/municipio").get_json()
    assert u["properties"]["codarea"] == "3524402"
    assert u["properties"]["area_km2"] > 0


def test_municipio_ausente(tmp_path):
    cliente = create_app(Config(tmp_path / "dados", None)).test_client()
    assert cliente.get("/api/municipio").status_code == 404
    assert cliente.get("/api/areas").get_json()["features"] == []


def test_operacoes_entre_areas(cliente):
    r = cliente.get(f"/api/conjuntos/operacao?a={A}&b={D}&op=uniao").get_json()
    assert r["estabelecimentos"] == [1, 2, 3, 4, 5]
    assert cliente.get(f"/api/conjuntos/operacao?a={A}&b={D}&op=x").status_code == 422
    assert cliente.get(f"/api/conjuntos/operacao?a={A}&b=99&op=uniao").status_code == 404
    erro = cliente.get("/api/conjuntos/operacao?a=um&b=2&op=uniao")
    assert erro.status_code == 422
    assert erro.get_json()["campo"] == "a"


def test_relacoes_produto_e_partes(cliente):
    assert cliente.get(f"/api/conjuntos/relacoes?a={A}&b={C}").get_json()["disjuntos"] is True
    produto = cliente.get("/api/conjuntos/produto").get_json()
    assert (produto["pares"], produto["pares_com_pertinencia"]) == (36, 10)
    partes = cliente.get("/api/conjuntos/partes").get_json()
    assert partes["tipos"] == ["escola", "industria", "residencia"]
    assert len(partes["linhas"]) == 8
    assert {"tipos": ["residencia"], "classes": ["residencial"]} in partes["linhas"]


def test_trechos_de_codigo(cliente):
    trechos = cliente.get("/api/teoria/trechos").get_json()["trechos"]
    uniao = next(t for t in trechos if t["nome"] == "uniao")
    assert uniao["arquivo"] == "zoneamento/geo/conjuntos.py"
    assert uniao["codigo"].startswith("def uniao(")
    assert 'how="union"' in uniao["codigo"]
    assert any(t["nome"] == "classes_da_area" for t in trechos)
