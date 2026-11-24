"""Backend do PRJ.15: cadastro e classificação de áreas com GeoPandas.

flask --app zoneamento run              # servidor de desenvolvimento
flask --app zoneamento semear --reset   # volta o cadastro à semente
"""

import click
from flask import Flask

from zoneamento.api import registrar_api
from zoneamento.config import Config
from zoneamento.repositorio.camadas import RepositorioGeo


def create_app(config: Config | None = None) -> Flask:
    """Fábrica da aplicação Flask."""
    config = config or Config.do_ambiente()
    app = Flask(__name__)
    app.json.ensure_ascii = False  # type: ignore[attr-defined]
    app.json.sort_keys = False  # type: ignore[attr-defined]
    app.extensions["repositorio"] = RepositorioGeo(config.diretorio_dados, config.diretorio_semente)
    registrar_api(app)

    @app.cli.command("semear")
    @click.option("--reset", is_flag=True, help="Descarta o cadastro atual e volta à semente.")
    def semear(reset: bool) -> None:
        """Mostra o cadastro em uso e, com --reset, o restaura a partir da semente."""
        repo: RepositorioGeo = app.extensions["repositorio"]
        if reset:
            repo.restaurar()
        click.echo(
            f"{len(repo.areas())} áreas e {len(repo.estabelecimentos())} estabelecimentos "
            f"em {repo.diretorio}"
        )

    return app
