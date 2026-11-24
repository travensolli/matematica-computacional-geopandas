"""Erros do domínio, traduzidos em respostas HTTP pela camada da API."""


class ErroValidacao(ValueError):
    """Entrada recusada. `campo` aponta o dado de origem, quando há um."""

    def __init__(self, mensagem: str, campo: str | None = None) -> None:
        super().__init__(mensagem)
        self.mensagem = mensagem
        self.campo = campo


class NaoEncontrado(LookupError):
    """Registro inexistente."""
