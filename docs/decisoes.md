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
