"""Baixa as fontes reais de Jacareí para `dados/brutos/` (pasta fora do git).

    python scripts/baixar_fontes.py            # baixa só o que ainda não existe
    python scripts/baixar_fontes.py --refazer  # baixa tudo de novo

Fontes:
- IBGE, API de malhas v3: limite do município de Jacareí (código 3524402), o conjunto universo U.
- OpenStreetMap, pela Overpass API: escolas, indústrias, uso do solo, parques e bairros.

A Overpass é um serviço público e às vezes fica sobrecarregada; por isso o script se identifica
com um User-Agent próprio, tenta de novo com espera crescente e alterna entre servidores. A
aplicação nunca depende destes downloads: ela usa a semente montada por `montar_semente.py`.
"""

import argparse
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

BRUTOS = Path(__file__).resolve().parents[1] / "dados" / "brutos"
AGENTE = "conjuntos-no-mapa/1.0 (trabalho academico)"
CODIGO_IBGE = "3524402"
URL_IBGE = (
    f"https://servicodados.ibge.gov.br/api/v3/malhas/municipios/{CODIGO_IBGE}"
    "?formato=application/vnd.geo%2Bjson&qualidade=maxima"
)
SERVIDORES_OVERPASS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.osm.jp/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]
# Caixa que envolve o limite do IBGE (sul, oeste, norte, leste) e a da mancha urbana, menor,
# usada nas consultas pesadas. O recorte exato pelo limite é feito depois, com o GeoPandas.
CAIXA = "-23.4200,-46.1540,-23.1720,-45.7930"
CAIXA_URBANA = "-23.3600,-46.0600,-23.2400,-45.8900"

CONSULTAS = {
    "osm_ensino": f"""
        nwr["amenity"~"^(school|college|university|kindergarten)$"]({CAIXA});
        out center tags;""",
    "osm_industria": f"""
        (nwr["landuse"="industrial"]({CAIXA});
         nwr["man_made"="works"]({CAIXA});
         nwr["building"~"^(industrial|factory)$"]["name"]({CAIXA}););
        out center tags;""",
    "osm_bairros": f"""
        node["place"~"^(suburb|neighbourhood|quarter)$"]({CAIXA});
        out;""",
    "osm_uso_do_solo": f"""
        way["landuse"~"^(industrial|residential)$"]({CAIXA_URBANA});
        out geom tags;""",
    "osm_parques": f"""
        way["leisure"="park"]["name"]({CAIXA_URBANA});
        out geom tags;""",
}


def _baixar(url: str, dados: bytes | None = None, tempo_limite: int = 180) -> bytes:
    pedido = urllib.request.Request(url, data=dados, headers={"User-Agent": AGENTE})
    with urllib.request.urlopen(pedido, timeout=tempo_limite) as resposta:
        return resposta.read()


def baixar_ibge(destino: Path) -> None:
    corpo = _baixar(URL_IBGE)
    json.loads(corpo)  # falha aqui se não vier JSON
    destino.write_bytes(corpo)


def baixar_overpass(consulta: str, destino: Path, tentativas: int = 10) -> None:
    texto = f"[out:json][timeout:170];\n{consulta}"
    dados = urllib.parse.urlencode({"data": texto}).encode()
    espera = 10
    for tentativa in range(tentativas):
        servidor = SERVIDORES_OVERPASS[tentativa % len(SERVIDORES_OVERPASS)]
        try:
            corpo = _baixar(servidor, dados)
            elementos = json.loads(corpo)["elements"]
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, KeyError) as erro:
            print(
                f"  {servidor}: {erro}. Nova tentativa em {espera} s.", file=sys.stderr, flush=True
            )
            time.sleep(espera)
            espera = min(espera * 2, 120)
            continue
        destino.write_bytes(corpo)
        print(f"  {len(elementos)} elementos de {servidor}", flush=True)
        return
    raise RuntimeError(f"Overpass indisponível depois de {tentativas} tentativas.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--refazer", action="store_true", help="baixa de novo o que já existe")
    args = parser.parse_args()
    BRUTOS.mkdir(parents=True, exist_ok=True)

    destino = BRUTOS / "ibge_municipio.geojson"
    if args.refazer or not destino.exists():
        print("IBGE: limite de Jacareí", flush=True)
        baixar_ibge(destino)

    for nome, consulta in CONSULTAS.items():
        destino = BRUTOS / f"{nome}.json"
        if args.refazer or not destino.exists():
            print(f"Overpass: {nome}", flush=True)
            baixar_overpass(consulta, destino)
    print(f"Pronto: {BRUTOS}")


if __name__ == "__main__":
    main()
