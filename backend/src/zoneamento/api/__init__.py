"""API HTTP do backend: JSON e GeoJSON sob o prefixo /api."""

from flask import Flask

from zoneamento.api import areas, conjuntos, consultas, estabelecimentos, saude, teoria
from zoneamento.api.erros import registrar_erros


def registrar_api(app: Flask) -> None:
    registrar_erros(app)
    for modulo in (saude, areas, estabelecimentos, consultas, conjuntos, teoria):
        app.register_blueprint(modulo.bp)
