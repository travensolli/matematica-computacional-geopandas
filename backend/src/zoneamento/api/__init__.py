"""API HTTP do backend: JSON e GeoJSON sob o prefixo /api."""

from flask import Flask

from zoneamento.api import saude
from zoneamento.api.erros import registrar_erros


def registrar_api(app: Flask) -> None:
    registrar_erros(app)
    for modulo in (saude,):
        app.register_blueprint(modulo.bp)
