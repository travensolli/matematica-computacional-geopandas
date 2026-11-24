"""Cruzamentos geoespaciais: consulta de ponto, sobreposições e o município (U)."""

from flask import Blueprint, request

from zoneamento.api.contexto import areas_classificadas, repositorio
from zoneamento.api.serializacao import colecao
from zoneamento.dominio.erros import NaoEncontrado
from zoneamento.geo.medidas import area_km2
from zoneamento.geo.zoneamento import consultar_ponto, sobreposicoes

bp = Blueprint("consultas", __name__, url_prefix="/api")


@bp.get("/consulta")
def consulta():
    return consultar_ponto(areas_classificadas(), request.args.get("lat"), request.args.get("lng"))


@bp.get("/sobreposicoes")
def listar_sobreposicoes():
    return colecao(sobreposicoes(repositorio().areas()))


@bp.get("/municipio")
def municipio():
    """O conjunto universo U da demonstração: o limite do município."""
    camada = repositorio().municipio()
    if camada is None or camada.empty:
        raise NaoEncontrado("O limite do município não foi carregado.")
    camada["area_km2"] = area_km2(camada, casas=1)
    return colecao(camada)["features"][0]
