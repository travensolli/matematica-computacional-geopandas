"""Monta a semente de Jacareí em `dados/semente/` a partir dos dados de `dados/brutos/`.

    python scripts/baixar_fontes.py    # uma vez, para ter os dados brutos
    python scripts/montar_semente.py

Saída, sempre igual para os mesmos dados brutos:
- municipio.geojson: o limite do IBGE, o universo U;
- areas.geojson: sete áreas, montadas aqui com o GeoPandas sobre feições reais;
- estabelecimentos.geojson: escolas e indústrias do OpenStreetMap, a Fatec Jacareí na coordenada
  do material de apoio e residências ilustrativas.

O OpenStreetMap não mapeia as casas de Jacareí uma a uma (no Residencial Fogaça há só uma), por
isso as residências são pontos ilustrativos, marcados com fonte "ilustrativa".
"""

import json
from pathlib import Path

import geopandas as gpd
import pandas as pd
import shapely
from shapely.geometry import Point, Polygon

RAIZ = Path(__file__).resolve().parents[1]
BRUTOS = RAIZ / "dados" / "brutos"
SEMENTE = RAIZ / "dados" / "semente"

GEOGRAFICO, METRICO = "EPSG:4326", "EPSG:31983"
CRIADO_EM = "2026-11-24T00:00:00"
#: Figura 14 das notas de aula: o ponto "Fatec Jacareí" (latitude −23,29521, longitude −45,96692).
FATEC = Point(-45.96692, -23.29521)

#: Feições do OpenStreetMap usadas como forma das áreas (ids de way).
OSM = {
    "fitesa": 835360216,
    "armco": 835349096,
    "heineken": 835349092,
    "dow": 621267423,
    "basf": 621271229,
    "residencial_fogaca": 769926686,
    "viveiro": 618513666,
    "parque_da_cidade": 323308140,
}


def _elementos(arquivo: str) -> list[dict]:
    return json.loads((BRUTOS / arquivo).read_text(encoding="utf-8"))["elements"]


def _poligono_osm(arquivo: str, way: int) -> Polygon:
    elemento = next(e for e in _elementos(arquivo) if e["id"] == way)
    return Polygon([(p["lon"], p["lat"]) for p in elemento["geometry"]])


def _em_metros(geometria):
    return gpd.GeoSeries([geometria], crs=GEOGRAFICO).to_crs(METRICO).iloc[0]


def _em_graus(geometria):
    return gpd.GeoSeries([geometria], crs=METRICO).to_crs(GEOGRAFICO).iloc[0]


def _envoltoria(geometrias: list, folga_m: float) -> Polygon:
    """Envoltória convexa das feições, com uma folga em metros: a área de um conjunto de lotes."""
    uniao = shapely.unary_union([_em_metros(g) for g in geometrias])
    return _em_graus(uniao.convex_hull.buffer(folga_m))


def municipio() -> gpd.GeoDataFrame:
    u = gpd.read_file(BRUTOS / "ibge_municipio.geojson").to_crs(GEOGRAFICO)
    return u.assign(nome="Jacareí", fonte="IBGE, malha municipal")[
        ["codarea", "nome", "fonte", "geometry"]
    ]


def areas() -> gpd.GeoDataFrame:
    uso = "osm_uso_do_solo.json"
    parques = "osm_parques.json"
    linhas = [
        (
            "Entorno da Fatec Jacareí",
            "desenhada sobre o mapa",
            Polygon(
                [
                    (-45.9735, -23.2930),
                    (-45.9630, -23.2925),
                    (-45.9620, -23.2990),
                    (-45.9640, -23.3030),
                    (-45.9700, -23.3030),
                    (-45.9750, -23.2985),
                ]
            ),
        ),
        (
            "Raio de 1 km da Fatec",
            "buffer de 1 km calculado com o GeoPandas",
            _em_graus(_em_metros(FATEC).buffer(1000, quad_segs=16)),
        ),
        (
            "Polo industrial da Via Dutra",
            "envoltória dos lotes industriais do OpenStreetMap",
            _envoltoria(
                [_poligono_osm(uso, OSM[k]) for k in ("fitesa", "armco", "heineken", "dow")]
                + [Point(-45.98075, -23.28478)],
                folga_m=120,
            ),
        ),
        (
            "Distrito industrial BASF–Sany",
            "envoltória dos lotes industriais do OpenStreetMap",
            _envoltoria([_poligono_osm(uso, OSM["basf"]), Point(-45.9692, -23.27033)], folga_m=150),
        ),
        (
            "Residencial Fogaça",
            f"OpenStreetMap, way/{OSM['residencial_fogaca']}",
            _poligono_osm(uso, OSM["residencial_fogaca"]),
        ),
        (
            "Viveiro Municipal",
            f"OpenStreetMap, way/{OSM['viveiro']}",
            _poligono_osm(parques, OSM["viveiro"]),
        ),
        (
            "Parque da Cidade",
            f"OpenStreetMap, way/{OSM['parque_da_cidade']}",
            _poligono_osm(parques, OSM["parque_da_cidade"]),
        ),
    ]
    return gpd.GeoDataFrame(
        {
            "id": range(1, len(linhas) + 1),
            "nome": [nome for nome, _, _ in linhas],
            "fonte": [fonte for _, fonte, _ in linhas],
            "criado_em": CRIADO_EM,
        },
        geometry=[geometria for _, _, geometria in linhas],
        crs=GEOGRAFICO,
    )


def _pontos_osm(arquivo: str, tipo: str, universo) -> gpd.GeoDataFrame:
    """Feições com nome, reduzidas ao centro, dentro de U e sem nomes repetidos."""
    linhas = []
    for e in _elementos(arquivo):
        nome = e.get("tags", {}).get("name")
        centro = e.get("center") or ({"lat": e["lat"], "lon": e["lon"]} if "lat" in e else None)
        if nome and centro:
            linhas.append(
                {
                    "nome": nome.strip(),
                    "tipo": tipo,
                    "fonte": "OpenStreetMap",
                    "osm_id": f"{e['type']}/{e['id']}",
                    "geometry": Point(centro["lon"], centro["lat"]),
                }
            )
    pontos = gpd.GeoDataFrame(linhas, geometry="geometry", crs=GEOGRAFICO)
    pontos = pontos[pontos.within(universo)].drop_duplicates("nome")
    return pontos.sort_values("nome", key=lambda s: s.str.lower()).reset_index(drop=True)


def _grade_dentro(poligono: Polygon, quantidade: int, passo_m: float) -> list[Point]:
    """Pontos numa grade regular dentro do polígono, espaçados, para as residências ilustrativas."""
    em_metros = _em_metros(poligono).buffer(-passo_m / 3)
    minx, miny, maxx, maxy = em_metros.bounds
    candidatos = [
        Point(minx + i * passo_m, miny + j * passo_m)
        for j in range(int((maxy - miny) / passo_m) + 1)
        for i in range(int((maxx - minx) / passo_m) + 1)
    ]
    dentro = [p for p in candidatos if em_metros.contains(p)]
    salto = max(1, len(dentro) // quantidade)
    return [_em_graus(p) for p in dentro[::salto][:quantidade]]


def estabelecimentos(universo, lista_areas: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    escolas = _pontos_osm("osm_ensino.json", "escola", universo)
    industrias = _pontos_osm("osm_industria.json", "industria", universo)
    fatec = gpd.GeoDataFrame(
        [
            {
                "nome": "Fatec Jacareí",
                "tipo": "escola",
                "fonte": "material de apoio, Figura 14",
                "osm_id": None,
                "geometry": FATEC,
            }
        ],
        geometry="geometry",
        crs=GEOGRAFICO,
    )
    por_nome = lista_areas.set_index("nome").geometry
    casas = _grade_dentro(por_nome["Residencial Fogaça"], 8, 70) + _grade_dentro(
        por_nome["Entorno da Fatec Jacareí"], 3, 260
    )
    residencias = gpd.GeoDataFrame(
        [
            {
                "nome": f"Residência ilustrativa {i}",
                "tipo": "residencia",
                "fonte": "ilustrativa",
                "osm_id": None,
                "geometry": ponto,
            }
            for i, ponto in enumerate(casas, start=1)
        ],
        geometry="geometry",
        crs=GEOGRAFICO,
    )
    todos = pd.concat([fatec, escolas, industrias, residencias], ignore_index=True)
    todos = gpd.GeoDataFrame(todos, geometry="geometry", crs=GEOGRAFICO)
    todos.insert(0, "id", range(1, len(todos) + 1))
    todos["criado_em"] = CRIADO_EM
    return todos[["id", "nome", "tipo", "fonte", "osm_id", "criado_em", "geometry"]]


def gravar(gdf: gpd.GeoDataFrame, nome: str) -> None:
    gdf.to_file(
        SEMENTE / f"{nome}.geojson",
        driver="GeoJSON",
        engine="pyogrio",
        layer=nome,
        COORDINATE_PRECISION=7,
        RFC7946="YES",
    )


def main() -> None:
    SEMENTE.mkdir(parents=True, exist_ok=True)
    u = municipio()
    lista_areas = areas()
    lista_estabelecimentos = estabelecimentos(u.geometry.union_all(), lista_areas)
    gravar(u, "municipio")
    gravar(lista_areas, "areas")
    gravar(lista_estabelecimentos, "estabelecimentos")
    contagem = lista_estabelecimentos["tipo"].value_counts().to_dict()
    print(f"Semente em {SEMENTE}: {len(lista_areas)} áreas e {contagem} estabelecimentos.")


if __name__ == "__main__":
    main()
