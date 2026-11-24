"""A aplicação Flask: saúde, erros em JSON e o comando semear."""


def test_saude(cliente):
    assert cliente.get("/api/saude").get_json() == {
        "status": "ok",
        "areas": 4,
        "estabelecimentos": 9,
        "municipio": True,
    }


def test_rotas_e_metodos_desconhecidos_em_json(cliente):
    r = cliente.get("/api/nao-existe")
    assert r.status_code == 404
    assert r.get_json()["erro"] == "Rota não encontrada."
    r = cliente.post("/api/saude")
    assert r.status_code == 405
    assert r.get_json()["erro"] == "Método não permitido nesta rota."


def test_comando_semear(app):
    repo = app.extensions["repositorio"]
    repo.remover("areas", 1)
    resultado = app.test_cli_runner().invoke(args=["semear", "--reset"])
    assert "4 áreas e 9 estabelecimentos" in resultado.output
    assert len(repo.areas()) == 4
