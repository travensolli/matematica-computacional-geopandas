"""Configuração do backend, lida das variáveis de ambiente."""

import os
from dataclasses import dataclass
from pathlib import Path

#: Pasta `backend/` quando o pacote roda a partir do código-fonte.
RAIZ_BACKEND = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class Config:
    """Onde ficam o cadastro em uso e a semente versionada que o inicia."""

    diretorio_dados: Path
    diretorio_semente: Path | None

    @classmethod
    def do_ambiente(cls) -> "Config":
        dados = os.getenv("ZONEAMENTO_DADOS") or RAIZ_BACKEND / "dados" / "execucao"
        semente = os.getenv("ZONEAMENTO_SEMENTE") or RAIZ_BACKEND / "dados" / "semente"
        return cls(Path(dados), Path(semente) if Path(semente).is_dir() else None)
