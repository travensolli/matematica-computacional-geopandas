# Registro de decisões

Formato: data, contexto, decisão e consequência. Dúvidas de interpretação do enunciado seguem
sempre a opção mais fiel ao texto original.

## 2026-11-24: Erro material no enunciado do PRJ.15

- **Contexto:** o PRJ.15 diz "Repita o projeto PRJ.13. mas utilizando como tecnologia para cadastro
  e cruzamento geoespacial o framework GeoPandas". O PRJ.13 do material é o modelo Naive Bayes de
  auto complementação de texto, que não tem cadastro nem cruzamento geoespacial.
- **Decisão:** o projeto repetido é o **PRJ.14** (cadastro de polígonos classificados em escolar,
  industrial ou residencial, mapa e consulta de ponto). O professor confirmou a correção.
- **Consequência:** todos os requisitos do PRJ.14 valem aqui, com o GeoPandas no lugar do banco.

## 2026-11-24: GeoPandas no lugar do banco de dados

- **Contexto:** o PRJ.14 pede PostgreSQL. Em conversa, o professor orientou que no PRJ.15 não se
  use banco de dados, e sim o GeoPandas. O próprio material reforça a leitura: o PRJ.17 pede para repetir
  o PRJ.15 usando operações em bancos de dados, com PostgreSQL.
- **Decisão:** o GeoPandas faz o cadastro e o cruzamento. As camadas vivem em memória como
  `GeoDataFrame` e são persistidas em arquivos GeoJSON por `GeoDataFrame.to_file` e lidas por
  `geopandas.read_file`. Não há SQL, PostGIS nem SQLite em lugar nenhum.
- **Consequência:** um protótipo anterior, que guardava as geometrias no PostGIS, foi descartado
  e não entrou no histórico. A lógica GeoPandas dele (classificação, consulta de ponto e
  sobreposições) foi reaproveitada.

## 2026-11-24: Classificação derivada do conteúdo da área

- **Contexto:** o enunciado define as classes pelo que há **no interior do polígono**: escolar
  contém ao menos uma escola, industrial contém ao menos uma fábrica ou indústria e residencial
  contém somente residências.
- **Decisão:** a área não recebe um tipo digitado. O sistema cadastra polígonos (áreas) e pontos
  (estabelecimentos do tipo escola, indústria ou residência) e calcula a classe de cada área a
  partir dos estabelecimentos que ela contém. Uma área com escola e indústria é escolar e
  industrial ao mesmo tempo. Uma área sem nenhum estabelecimento fica sem classificação.
- **Consequência:** cadastrar ou excluir um estabelecimento reclassifica as áreas na hora. A regra
  é escrita como operações de conjuntos e testada sobre todos os subconjuntos de tipos.

## 2026-11-24: Interior do polígono e consulta de ponto

- **Contexto:** "no interior do polígono" e "o tipo de área ao qual o ponto selecionado pertence",
  com polígonos que podem se sobrepor.
- **Decisão:** a pertinência usa o predicado `within` do GeoPandas: um ponto exatamente sobre a
  borda não pertence à área. A resposta da consulta é a união das classes de todas as áreas que
  contêm o ponto.
- **Consequência:** um ponto na sobreposição de uma área escolar com uma industrial responde
  "escolar e industrial" e lista as duas áreas.

## 2026-11-24: Jacareí como cidade da demonstração

- **Contexto:** o enunciado pede ilustrar o sistema com a cidade da faculdade, a Fatec Jacareí. O
  material de apoio usa o ponto "Fatec Jacareí" (−23,29521; −45,96692) e a malha municipal do IBGE,
  em que Jacareí tem o código 3524402.
- **Decisão:** o limite municipal do IBGE é o conjunto universo U da demonstração. Escolas e
  indústrias vêm do OpenStreetMap; a Fatec entra pela coordenada do material, porque não está
  nomeada no OpenStreetMap.
- **Consequência:** os dados são baixados uma vez por script e versionados. A aplicação não
  depende de serviço externo para funcionar.

## 2026-11-24: Arquitetura e versionamento

- **Backend:** Python com Flask e GeoPandas, em `backend/`. **Frontend:** React, Vite, TypeScript e
  Leaflet, em `frontend/`. As duas partes conversam só por HTTP, em JSON e GeoJSON.
- **Versionamento:** Gitflow com `main`, `develop`, `feature/*` e `release/*`, merges `--no-ff` e
  tags `vX.Y.Z`. Commits em Conventional Commits, em português, com escopos fixos (`geo`, `api`,
  `dados`, `web`, `docs`, `infra`, `repo`), conferidos por hook e pelo CI.

## 2026-11-24: Material de apoio fora do repositório

- **Contexto:** o material da disciplina autoriza cópia só para uso pessoal, sem disponibilizar
  acesso a terceiros, e o repositório é público.
- **Decisão:** o PDF fica fora do git. A parte teórica do sistema e do README parafraseia os
  conceitos e cita o material no formato pedido pelo autor.

## 2026-11-24: Contexto não informado

- O tempo de apresentação não foi informado. Por isso não há modo apresentação; o roteiro de
  demonstração com Jacareí fica no README.

## 2026-11-24: As operações de conjuntos ficam num módulo só

- **Contexto:** a parte teórica precisa mostrar o código que o sistema de fato executa, e não uma
  cópia que possa divergir dele.
- **Decisão:** `backend/src/zoneamento/geo/conjuntos.py` concentra pertinência, igualdade,
  inclusão, união, intersecção, diferenças e produto cartesiano. Cada função é curta e cita a
  seção e a equação das notas de aula. Classificação, consulta de ponto e sobreposições são
  compostas a partir dele.
- **Consequência:** a página Teoria pode exibir o código-fonte dessas funções lido do próprio
  backend. A regra de classificação fica em `dominio/classificacao.py`, sobre `set` do Python, e é
  testada em todo o conjunto das partes de T.

## 2026-11-24: Ambiente de desenvolvimento

- Python 3.14.4 com venv próprio em `backend/.venv`, criado com `python -m venv` e instalado com
  `pip install -e ".[dev]"`; o `uv` não está instalado na máquina.
- GeoPandas 1.2, Shapely 2.2, pandas 3.1, pyogrio 0.13 e pyproj 3.8.
- Node 22.22.1 e pnpm 10.34.5, fixado em `packageManager`.
- Os nomes das exceções do domínio ficam em português (`ErroValidacao`, `NaoEncontrado`); por
  isso a regra N818 do ruff está desligada.

## 2026-11-24: O que conta como sobreposição

- **Contexto:** o overlay da camada de áreas com ela mesma devolve também A ∩ A e os pares
  repetidos (B ∩ A), e duas áreas vizinhas que só dividem a borda têm interseção de área nula.
- **Decisão:** ficam só os pares com `id_1 < id_2` e área de pelo menos 1 m². Um estabelecimento
  pode pertencer a duas áreas ao mesmo tempo, e conta em ambas.
- **Consequência:** a camada de sobreposições mostra exatamente as regiões A ∩ B do diagrama de
  Venn do mapa, sem duplicatas.

## 2026-11-24: Como o GeoPandas faz o papel do banco

- **Contexto:** sem banco de dados, o cadastro precisa sobreviver a reinícios do servidor e a
  requisições simultâneas.
- **Decisão:**
  - cada camada (`areas`, `estabelecimentos`) é um GeoDataFrame em memória, gravado em
    `backend/dados/execucao/<camada>.geojson` com `to_file` a cada alteração;
  - a gravação vai para um arquivo temporário e só então substitui o original (`os.replace`);
  - uma trava (`threading.RLock`) serializa as escritas;
  - o id novo é o maior id existente mais um;
  - as coordenadas são gravadas com 7 casas decimais (cerca de 1 cm) e arredondadas para essa
    grade antes de comparar, para que a igualdade A = B funcione com o que está no arquivo;
  - na primeira execução, o diretório é preenchido com a semente versionada.
- **Consequência:** o servidor roda com um único processo (várias threads), para que todas as
  requisições vejam a mesma memória. O arquivo GeoJSON pode ser aberto em qualquer SIG ou no
  próprio Leaflet.

## 2026-11-24: Contrato da API

- **Erros:** entrada recusada responde 422 e registro ou rota inexistente responde 404, sempre no
  formato `{erro, campo, detalhes}` e em português. O pydantic confere a estrutura do corpo
  (campos obrigatórios, tipos, campos a mais) e a validação do domínio confere as regras
  (polígono válido, tipo de estabelecimento, coordenadas).
- **Classificação nunca gravada:** a classe de uma área é recalculada a cada leitura a partir dos
  estabelecimentos. A área criada ou editada já volta classificada na resposta.
- **A ⊆ U é informativo:** cada área traz `dentro_do_municipio`, mas o cadastro não é bloqueado
  fora de Jacareí. O sistema vale para qualquer região; Jacareí é a ilustração pedida.
- **Código exibido é o código executado:** `/api/teoria/trechos` devolve, com `inspect.getsource`,
  o código-fonte das funções de conjuntos e da regra de classificação, e `/api/conjuntos/partes`
  devolve a tabela de P(T) calculada pela própria regra.

## 2026-11-24: Mapa base e acessibilidade do mapa

- **Mapa base:** os blocos da CARTO passaram a exigir chave de API. O sistema usa os blocos padrão
  do OpenStreetMap, sem chave e com atribuição, e um filtro CSS só na camada de blocos os deixa em
  cinza (invertidos no tema escuro). As hachuras das classes ficam em destaque sobre a planta.
- **Marcadores fora da tabulação:** com mais de uma centena de estabelecimentos, os marcadores
  não entram na ordem do Tab. Quem navega pelo teclado tem a lista de áreas, a consulta por
  coordenadas e o botão "Usar o centro do mapa".
- **Consulta na URL:** `/mapa?lat=…&lng=…` abre a consulta pronta, para compartilhar um resultado.

## 2026-11-24: Cadastro pela interface

- **Desenho:** o Leaflet-Geoman substitui o Leaflet.draw do protótipo, que está sem manutenção.
  Ele tem dicas em português e recusa arestas que se cruzam já no desenho; o servidor valida de
  novo antes de gravar.
- **Reclassificação explicada:** ao salvar ou excluir um estabelecimento, a interface compara a
  classificação das áreas antes e depois e diz quais mudaram, por exemplo "Vila residencial passou
  de residencial para escolar".
- **Exclusão sempre confirmada** num diálogo que nomeia a ação ("Excluir área").
- **Restaurar a semente com o servidor parado:** `flask --app zoneamento semear --reset` regrava os
  arquivos, mas um servidor que já está rodando continua com o cadastro na memória. Pare o
  servidor, restaure e suba de novo.

## 2026-11-24: A parte teórica do sistema

- **Lugar:** a tela inicial (`/`) é a parte teórica. Ela abre com a ideia central ("cada área do
  mapa é um conjunto"), define as classes em notação de conjuntos e percorre os conceitos das
  notas de aula na ordem do material, cada um ligado à tela onde trabalha.
- **Nada copiado à mão:** o código exibido vem de `/api/teoria/trechos`, a tabela de P(T) de
  `/api/conjuntos/partes` e os números do produto cartesiano de `/api/conjuntos/produto`.
- **Fórmulas em MathML**, legíveis por leitores de tela, sempre acompanhadas de uma leitura em
  português. A fonte é a Libertinus Math, servida pelo app: na STIX Two, o _e_ itálico parecia
  um _c_ em telas de densidade comum, como as de projetor.
- **Material citado, não reproduzido:** os conceitos são parafraseados e a referência segue o
  formato pedido pelo autor.

## 2026-11-24: A semente de Jacareí

- **Fontes:**
  - o limite do município vem da API de malhas do IBGE (código 3524402);
  - escolas, indústrias, lotes industriais, condomínios residenciais e parques vêm do
    OpenStreetMap, baixados uma vez por `scripts/baixar_fontes.py`;
  - `scripts/montar_semente.py` monta a semente versionada em `backend/dados/semente/`.
- **Áreas:**
  - o entorno da Fatec Jacareí, desenhado;
  - o raio de 1 km da Fatec, calculado com `buffer`;
  - o polo industrial da Via Dutra e o distrito BASF–Sany, envoltórias dos lotes industriais;
  - o Residencial Fogaça, o Viveiro Municipal e o Parque da Cidade, polígonos do OpenStreetMap.
- **Casos reais:**
  - o polo industrial é escolar e industrial porque o SEST SENAT, um centro de formação, fica
    dentro dele;
  - o Parque da Cidade ⊂ entorno da Fatec ⊂ raio de 1 km dá dois subconjuntos próprios.
- **Residências ilustrativas:** o OpenStreetMap não mapeia as casas de Jacareí uma a uma (no
  Residencial Fogaça há uma só). As 11 residências são pontos ilustrativos, com fonte
  "ilustrativa", e só servem para classificar o Residencial Fogaça e o entorno da Fatec.
- **Fatec Jacareí:** a escola não tem nome no OpenStreetMap; entra pela coordenada da Figura 14
  do material de apoio.
- **Overpass:** a instância principal recusa o User-Agent padrão do curl e estava sobrecarregada.
  O script se identifica, espera cada vez mais entre as tentativas e alterna entre cinco
  servidores. O app nunca depende dela em execução.

## 2026-11-24: Laboratório de operações

- **Tela própria (`/operacoes`)** para as operações da teoria sobre áreas reais: A ∪ B, A ∩ B,
  A − B, B − A e A Δ B, mais as relações =, ⊆, ⊂ e a disjunção, e o produto cartesiano E × A.
- **PRJ.14 × PRJ.15 lado a lado:** cada resultado mostra a chamada GeoPandas executada
  (`gpd.overlay`) e a consulta equivalente em PostGIS (`ST_Intersection` e afins), que é o que
  o PRJ.14 faria no banco.
- **A e B como no diagrama de Venn:** no mapa, A tem hachura numa direção e contorno contínuo, B
  na outra e contorno tracejado, com a letra no centro, e o resultado aparece na cor de resultado
  da página Teoria.
