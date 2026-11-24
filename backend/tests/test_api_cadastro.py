"""Rotas de cadastro: áreas e estabelecimentos."""

import pytest

A, C, D = 1, 3, 4
NOVA = {
    "type": "Polygon",
    "coordinates": [
        [[-45.99, -23.34], [-45.98, -23.34], [-45.98, -23.33], [-45.99, -23.33], [-45.99, -23.34]]
    ],
}


def _classes(cliente):
    areas = cliente.get("/api/areas").get_json()["features"]
    return {f["properties"]["id"]: f["properties"]["classes"] for f in areas}


def test_lista_areas_classificadas(cliente):
    colecao = cliente.get("/api/areas").get_json()
    assert colecao["type"] == "FeatureCollection"
    d = next(f for f in colecao["features"] if f["properties"]["id"] == D)
    p = d["properties"]
    assert p["classes"] == ["escolar", "industrial"]
    assert (p["escolas"], p["industrias"], p["residencias"]) == (1, 1, 0)
    assert p["estabelecimentos"] == [2, 5]
    assert p["dentro_do_municipio"] is True
    assert p["area_km2"] > 0
    assert d["geometry"]["type"] == "Polygon"


def test_cria_area_e_devolve_ja_classificada(cliente):
    r = cliente.post("/api/areas", json={"nome": "Nova", "geometry": NOVA})
    assert r.status_code == 201
    p = r.get_json()["properties"]
    assert (p["id"], p["nome"], p["classes"], p["fonte"]) == (5, "Nova", [], "cadastro")


@pytest.mark.parametrize(
    ("corpo", "campo", "trecho"),
    [
        ({"geometry": NOVA}, "nome", "Campo obrigatório"),
        ({"nome": "x", "geometry": NOVA, "cor": "azul"}, "cor", "Campo não reconhecido"),
        ({"nome": " ", "geometry": NOVA}, "nome", "Informe um nome"),
        (
            {"nome": "x", "geometry": {"type": "Point", "coordinates": [0, 0]}},
            "geometry",
            "polígono",
        ),
    ],
)
def test_cria_area_com_erro(cliente, corpo, campo, trecho):
    r = cliente.post("/api/areas", json=corpo)
    assert r.status_code == 422
    erro = r.get_json()
    assert erro["campo"] == campo
    assert trecho in erro["erro"]


def test_area_igual_a_existente(cliente):
    a = cliente.get("/api/areas").get_json()["features"][0]
    r = cliente.post("/api/areas", json={"nome": "cópia", "geometry": a["geometry"]})
    assert r.status_code == 422
    assert "exatamente esses limites" in r.get_json()["erro"]


def test_corpo_que_nao_e_json(cliente):
    r = cliente.post("/api/areas", data="nome=x", content_type="text/plain")
    assert r.status_code == 422
    assert "objeto JSON" in r.get_json()["erro"]


def test_edita_e_exclui_area(cliente):
    r = cliente.patch(f"/api/areas/{A}", json={"nome": "Centro"})
    assert r.get_json()["properties"]["nome"] == "Centro"
    assert cliente.patch(f"/api/areas/{A}", json={}).status_code == 422
    assert cliente.delete(f"/api/areas/{A}").status_code == 204
    assert cliente.delete(f"/api/areas/{A}").status_code == 404
    assert cliente.patch("/api/areas/99", json={"nome": "x"}).status_code == 404


def test_escola_reclassifica_area_residencial(cliente):
    assert _classes(cliente)[C] == ["residencial"]
    r = cliente.post(
        "/api/estabelecimentos",
        json={"nome": "Escola nova", "tipo": "escola", "lat": -23.3250, "lng": -45.9650},
    )
    assert r.status_code == 201
    assert r.get_json()["properties"]["tipo"] == "escola"
    assert _classes(cliente)[C] == ["escolar"]


def test_estabelecimentos_crud(cliente):
    colecao = cliente.get("/api/estabelecimentos").get_json()
    assert len(colecao["features"]) == 9
    r = cliente.patch("/api/estabelecimentos/1", json={"tipo": "industria"})
    assert r.get_json()["properties"]["tipo"] == "industria"
    assert _classes(cliente)[A] == ["industrial"]
    assert cliente.delete("/api/estabelecimentos/1").status_code == 204
    assert _classes(cliente)[A] == ["residencial"]


@pytest.mark.parametrize(
    ("corpo", "campo"),
    [
        ({"nome": "x", "tipo": "escola", "lat": "abc", "lng": -45.9}, "lat"),
        ({"nome": "x", "tipo": "fabrica", "lat": -23.3, "lng": -45.9}, "tipo"),
        ({"nome": "x", "tipo": "escola", "lat": 95, "lng": -45.9}, "lat"),
    ],
)
def test_estabelecimento_invalido(cliente, corpo, campo):
    r = cliente.post("/api/estabelecimentos", json=corpo)
    assert r.status_code == 422
    assert r.get_json()["campo"] == campo
