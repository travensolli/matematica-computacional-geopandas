"""O "banco de dados" do sistema: camadas GeoPandas em memória, persistidas em GeoJSON.

Por orientação do professor, o PRJ.15 não usa banco de dados. Cada camada é um GeoDataFrame
lido com `geopandas.read_file` e gravado de novo com `GeoDataFrame.to_file` a cada alteração.
A gravação é atômica (arquivo temporário seguido de `os.replace`), e uma trava serializa as
escritas, porque o servidor atende requisições em várias threads.
"""

import os
import shutil
import threading
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import geopandas as gpd
import pandas as pd
from shapely.geometry.base import BaseGeometry

from zoneamento.dominio.erros import NaoEncontrado
from zoneamento.geo.camada import camada_vazia
from zoneamento.geo.crs import CRS_GEOGRAFICO

#: Camadas editáveis e as colunas que toda linha tem.
COLUNAS: dict[str, list[str]] = {
    "areas": ["id", "nome", "fonte", "criado_em"],
    "estabelecimentos": ["id", "nome", "tipo", "fonte", "osm_id", "criado_em"],
}
#: Limite do município: o conjunto universo U, só leitura.
MUNICIPIO = "municipio"
#: Casas decimais das coordenadas gravadas. 1e-7 grau ≈ 1 cm no equador.
CASAS_DECIMAIS = 7
#: Datas em UTC. O leitor GeoJSON reconhece esse formato e o converte em data.
FORMATO_DATA = "%Y-%m-%dT%H:%M:%S"


def _arquivo(diretorio: Path, camada: str) -> Path:
    return diretorio / f"{camada}.geojson"


def _agora() -> str:
    """Instante atual em UTC, no formato ISO sem fuso, igual ao que a leitura do GeoJSON devolve."""
    return datetime.now(UTC).strftime(FORMATO_DATA)


def _normalizar(gdf: gpd.GeoDataFrame, colunas: list[str]) -> gpd.GeoDataFrame:
    """Recompõe as colunas que a leitura de um arquivo vazio perde e fixa os tipos."""
    for coluna in colunas:
        if coluna not in gdf.columns:
            gdf[coluna] = pd.Series([None] * len(gdf), index=gdf.index, dtype="object")
    if gdf["id"].isna().any():
        # Semente escrita à mão, sem ids: numera na ordem do arquivo.
        gdf["id"] = range(1, len(gdf) + 1)
    gdf["id"] = gdf["id"].astype("int64")
    if pd.api.types.is_datetime64_any_dtype(gdf["criado_em"]):
        gdf["criado_em"] = gdf["criado_em"].dt.strftime(FORMATO_DATA)
    extras = [c for c in gdf.columns if c not in colunas and c != gdf.geometry.name]
    return gdf[[*colunas, *extras, gdf.geometry.name]].reset_index(drop=True)


class RepositorioGeo:
    """Guarda as camadas de áreas e de estabelecimentos e o limite do município."""

    def __init__(self, diretorio: Path | str, semente: Path | str | None = None) -> None:
        self.diretorio = Path(diretorio)
        self.semente = Path(semente) if semente else None
        self.diretorio.mkdir(parents=True, exist_ok=True)
        self._trava = threading.RLock()
        if self.semente and not any(
            _arquivo(self.diretorio, c).exists() for c in (*COLUNAS, MUNICIPIO)
        ):
            self._copiar_semente()
        self._carregar()

    # ---- leitura ------------------------------------------------------------------------------

    def areas(self) -> gpd.GeoDataFrame:
        with self._trava:
            return self._camadas["areas"].copy()

    def estabelecimentos(self) -> gpd.GeoDataFrame:
        with self._trava:
            return self._camadas["estabelecimentos"].copy()

    def municipio(self) -> gpd.GeoDataFrame | None:
        with self._trava:
            return None if self._municipio is None else self._municipio.copy()

    def obter(self, camada: str, registro_id: int) -> dict:
        """Um registro pelo id; levanta NaoEncontrado se ele não existir."""
        with self._trava:
            return self._registro(camada, registro_id)

    # ---- escrita ------------------------------------------------------------------------------

    def inserir(self, camada: str, atributos: dict[str, Any], geometria: BaseGeometry) -> dict:
        """Acrescenta uma linha com id novo e devolve o registro gravado."""
        with self._trava:
            atual = self._camadas[camada]
            novo_id = int(atual["id"].max()) + 1 if len(atual) else 1
            linha = {c: None for c in atual.columns if c != atual.geometry.name}
            linha.update(atributos, id=novo_id, criado_em=_agora())
            nova = gpd.GeoDataFrame([linha], geometry=[geometria], crs=CRS_GEOGRAFICO)
            juntas = pd.concat([atual, nova], ignore_index=True)
            self._substituir(camada, gpd.GeoDataFrame(juntas, crs=CRS_GEOGRAFICO))
            return self._registro(camada, novo_id)

    def atualizar(
        self,
        camada: str,
        registro_id: int,
        atributos: dict[str, Any],
        geometria: BaseGeometry | None = None,
    ) -> dict:
        """Altera atributos e, se vier, a geometria de uma linha existente."""
        with self._trava:
            atual = self._camadas[camada].copy()
            posicao = self._posicao(camada, registro_id)
            for coluna, valor in atributos.items():
                atual.loc[posicao, coluna] = valor
            if geometria is not None:
                atual.loc[posicao, atual.geometry.name] = geometria
            self._substituir(camada, atual)
            return self._registro(camada, registro_id)

    def remover(self, camada: str, registro_id: int) -> None:
        with self._trava:
            atual = self._camadas[camada]
            posicao = self._posicao(camada, registro_id)
            self._substituir(camada, atual.drop(index=posicao).reset_index(drop=True))

    def restaurar(self) -> None:
        """Volta as camadas ao estado da semente."""
        if self.semente is None:
            raise RuntimeError("Este repositório não tem semente para restaurar.")
        with self._trava:
            self._copiar_semente()
            self._carregar()

    # ---- internos -----------------------------------------------------------------------------

    def _copiar_semente(self) -> None:
        assert self.semente is not None
        for camada in (*COLUNAS, MUNICIPIO):
            origem = _arquivo(self.semente, camada)
            destino = _arquivo(self.diretorio, camada)
            if origem.exists():
                shutil.copyfile(origem, destino)
            elif destino.exists():
                destino.unlink()

    def _carregar(self) -> None:
        self._camadas: dict[str, gpd.GeoDataFrame] = {
            camada: self._ler(camada, colunas) for camada, colunas in COLUNAS.items()
        }
        caminho = _arquivo(self.diretorio, MUNICIPIO)
        self._municipio = gpd.read_file(caminho) if caminho.exists() else None

    def _ler(self, camada: str, colunas: list[str]) -> gpd.GeoDataFrame:
        caminho = _arquivo(self.diretorio, camada)
        if not caminho.exists():
            return camada_vazia(colunas)
        gdf = gpd.read_file(caminho)
        if gdf.crs is None:
            gdf = gdf.set_crs(CRS_GEOGRAFICO)
        return _normalizar(gdf.to_crs(CRS_GEOGRAFICO), colunas)

    def _posicao(self, camada: str, registro_id: int) -> int:
        atual = self._camadas[camada]
        achados = atual.index[atual["id"] == registro_id]
        if len(achados) == 0:
            raise NaoEncontrado(f"Registro {registro_id} não encontrado em {camada}.")
        return int(achados[0])

    def _registro(self, camada: str, registro_id: int) -> dict:
        atual = self._camadas[camada]
        linha = atual.loc[self._posicao(camada, registro_id)]
        return {c: linha[c] for c in atual.columns}

    def _substituir(self, camada: str, gdf: gpd.GeoDataFrame) -> None:
        """Grava no disco e, só depois de gravar, troca a camada em memória."""
        destino = _arquivo(self.diretorio, camada)
        temporario = destino.with_name(f".{destino.name}.tmp")
        gdf.to_file(
            temporario,
            driver="GeoJSON",
            engine="pyogrio",
            layer=camada,
            COORDINATE_PRECISION=CASAS_DECIMAIS,
            RFC7946="YES",
        )
        os.replace(temporario, destino)
        self._camadas[camada] = _normalizar(gdf.copy(), COLUNAS[camada])
