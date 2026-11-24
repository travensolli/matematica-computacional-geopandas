"""Validação das entradas do cadastro, antes de qualquer gravação."""

import math
from typing import Any

from shapely.geometry import Point, Polygon, shape
from shapely.validation import explain_validity

from zoneamento.dominio.erros import ErroValidacao
from zoneamento.dominio.tipos import TipoEstabelecimento

TAMANHO_MAXIMO_NOME = 120

_MOTIVOS = {
    "Self-intersection": "as arestas do polígono se cruzam",
    "Ring Self-intersection": "o contorno do polígono passa duas vezes pelo mesmo ponto",
    "Too few points": "o polígono precisa de pelo menos três vértices diferentes",
    "Hole lies outside shell": "um buraco do polígono fica fora do contorno",
    "Interior is disconnected": "o interior do polígono fica dividido em partes",
}


def validar_nome(nome: Any, campo: str = "nome") -> str:
    """Nome obrigatório, com espaços das pontas removidos e até 120 caracteres."""
    texto = nome.strip() if isinstance(nome, str) else ""
    if not texto:
        raise ErroValidacao("Informe um nome.", campo)
    if len(texto) > TAMANHO_MAXIMO_NOME:
        raise ErroValidacao(f"O nome deve ter no máximo {TAMANHO_MAXIMO_NOME} caracteres.", campo)
    return texto


def validar_tipo(tipo: Any) -> TipoEstabelecimento:
    """Tipo do estabelecimento: escola, industria ou residencia."""
    try:
        return TipoEstabelecimento(tipo)
    except ValueError:
        raise ErroValidacao("O tipo deve ser escola, industria ou residencia.", "tipo") from None


def validar_coordenada(lat: Any, lng: Any) -> tuple[float, float]:
    """Latitude em [−90, 90] e longitude em [−180, 180], como números reais finitos."""
    try:
        lat_f, lng_f = float(lat), float(lng)
    except (TypeError, ValueError):
        raise ErroValidacao("Latitude e longitude devem ser números.", "lat") from None
    if not (math.isfinite(lat_f) and math.isfinite(lng_f)):
        raise ErroValidacao("Latitude e longitude devem ser números finitos.", "lat")
    if not -90 <= lat_f <= 90:
        raise ErroValidacao("A latitude deve estar entre −90 e 90.", "lat")
    if not -180 <= lng_f <= 180:
        raise ErroValidacao("A longitude deve estar entre −180 e 180.", "lng")
    return lat_f, lng_f


def validar_ponto(lat: Any, lng: Any) -> Point:
    """Ponto do Shapely a partir de latitude e longitude. Atenção: x é a longitude."""
    lat_f, lng_f = validar_coordenada(lat, lng)
    return Point(lng_f, lat_f)


def _motivo(poligono: Polygon) -> str:
    """Motivo da invalidez em português, sem as coordenadas que o GEOS anexa."""
    texto = explain_validity(poligono)
    for chave, motivo in _MOTIVOS.items():
        if texto.startswith(chave):
            return motivo
    return texto.split("[", 1)[0].strip()


def validar_poligono(geometria: Any, campo: str = "geometry") -> Polygon:
    """Polígono simples e válido, a partir da geometria GeoJSON que o Leaflet envia."""
    if not isinstance(geometria, dict):
        raise ErroValidacao("Envie a geometria da área em GeoJSON.", campo)
    try:
        poligono = shape(geometria)
    except Exception:
        raise ErroValidacao("Geometria em formato GeoJSON inválido.", campo) from None
    if poligono.geom_type != "Polygon":
        raise ErroValidacao("A área deve ser um polígono.", campo)
    if poligono.is_empty or len(set(poligono.exterior.coords)) < 3:
        raise ErroValidacao(_MOTIVOS["Too few points"].capitalize() + ".", campo)
    minx, miny, maxx, maxy = poligono.bounds
    if minx < -180 or maxx > 180 or miny < -90 or maxy > 90:
        raise ErroValidacao("O polígono tem vértices fora do intervalo de coordenadas.", campo)
    # Pontos colineares (área nula) também caem aqui, como autointerseção.
    if not poligono.is_valid:
        raise ErroValidacao(f"Polígono inválido: {_motivo(poligono)}.", campo)
    return poligono
