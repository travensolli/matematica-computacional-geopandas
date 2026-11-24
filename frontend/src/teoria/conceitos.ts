import type { FiguraVenn } from './DiagramaVenn';

/* Os conceitos das notas de aula (Carvalho, 2026), na ordem do material, cada um ligado ao
   que o sistema faz com ele. As fórmulas usam a notação compacta de Formula.tsx. */

export interface Conceito {
  id: string;
  titulo: string;
  /** Seção e equação das notas de aula. */
  referencia: string;
  formulas: string[];
  /** Como ler a fórmula, para quem não conhece a notação. */
  leitura: string;
  noSistema: string;
  link?: { para: string; rotulo: string };
  figura: FiguraVenn;
  /** Funções do backend cujo código-fonte é exibido. */
  funcoes: string[];
}

export const CONCEITOS: Conceito[] = [
  {
    id: 'pertinencia',
    titulo: 'Pertinência',
    referencia: '§1, eq. (1) e (2)',
    formulas: ['p ∈ A', 'q ∉ A'],
    leitura:
      'Lê-se “p pertence a A” e “q não pertence a A”. Um polígono tem infinitos pontos; um ponto pertence a ele quando está no seu interior.',
    noSistema:
      'Ao clicar no mapa, o sistema testa p ∈ a para cada área cadastrada, com uma junção espacial (sjoin) de predicado within. Um ponto exatamente sobre a borda não pertence à área.',
    link: { para: '/mapa', rotulo: 'Consultar um ponto no mapa' },
    figura: 'pertinencia',
    funcoes: ['pertence'],
  },
  {
    id: 'notacoes',
    titulo: 'Enumeração e propriedade',
    referencia: '§2',
    formulas: ['E(a) = { "Fatec" , "ETEC" , … }', 'Escolares = { a ∈ A | escola ∈ T(a) }'],
    leitura:
      'Um conjunto pode ser dado pela lista dos seus elementos (enumeração) ou por uma propriedade que só eles têm. Os conectivos ∧ (e) e ∨ (ou) juntam condições.',
    noSistema:
      'A lista de estabelecimentos de uma área é o conjunto por enumeração. As classes são definidas por propriedade, e é essa definição que o código implementa, linha por linha.',
    link: { para: '/mapa', rotulo: 'Ver as áreas e o que elas contêm' },
    figura: 'cardinalidade',
    funcoes: ['classes_da_area'],
  },
  {
    id: 'universo',
    titulo: 'Diagrama de Venn e universo',
    referencia: '§2, Figura 1',
    formulas: ['A ⊆ U', 'B ⊆ U'],
    leitura:
      'No diagrama de Venn, o retângulo é o universo U, que contém todos os elementos possíveis, e cada conjunto é uma região dentro dele.',
    noSistema:
      'O mapa é um diagrama de Venn. O limite de Jacareí, vindo do IBGE (código 3524402), é o universo U, desenhado em traço e ponto, e cada área cadastrada é uma região dentro dele. O sistema informa se a área está contida em U.',
    link: { para: '/mapa', rotulo: 'Ver o universo no mapa' },
    figura: 'universo',
    funcoes: [],
  },
  {
    id: 'numeros',
    titulo: 'Conjuntos numéricos',
    referencia: '§3',
    formulas: ['ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ', 'latitude ∈ [ −90 , 90 ] ⊂ ℝ'],
    leitura:
      'Cada conjunto numérico estende o anterior. O computador guarda números reais como aproximações racionais, os números de ponto flutuante.',
    noSistema:
      'Ids e contagens são naturais. Latitude e longitude são reais, gravados com 7 casas decimais, cerca de 1 cm. A área em km² é um real positivo, calculada depois de projetar as coordenadas para metros (SIRGAS 2000 / UTM 23S), porque grau não é unidade de área.',
    figura: 'numeros',
    funcoes: [],
  },
  {
    id: 'cardinalidade',
    titulo: 'Conjunto vazio e cardinalidade',
    referencia: '§2 e §2.1',
    formulas: ['E(a) = ∅', '#E(a)# = 3'],
    leitura:
      'O conjunto vazio não tem elementos. A cardinalidade |X| é a quantidade de elementos de um conjunto finito.',
    noSistema:
      'Uma área sem estabelecimentos tem E(a) = ∅ e fica sem classificação. As contagens de escolas, indústrias e residências de cada área são cardinalidades, calculadas com o groupby do pandas.',
    link: { para: '/mapa', rotulo: 'Ver as contagens na lista de áreas' },
    figura: 'cardinalidade',
    funcoes: [],
  },
  {
    id: 'igualdade',
    titulo: 'Igualdade',
    referencia: '§4.1, eq. (9)',
    formulas: ['A = B ↔ ∀x ( x ∈ A ↔ x ∈ B )'],
    leitura:
      'Dois conjuntos são iguais quando têm exatamente os mesmos elementos, em qualquer ordem.',
    noSistema:
      'O cadastro recusa uma área com exatamente os mesmos pontos de outra, mesmo que os vértices tenham sido desenhados em outra ordem ou a partir de outro vértice, como em {a, b} = {b, a}.',
    figura: 'igualdade',
    funcoes: ['iguais'],
  },
  {
    id: 'subconjunto',
    titulo: 'Subconjunto',
    referencia: '§4.2, eq. (10) e (11)',
    formulas: ['A ⊆ B ↔ ∀x ( x ∈ A → x ∈ B )', 'A ⊂ B ↔ A ⊆ B ∧ A ≠ B'],
    leitura:
      'A é subconjunto de B quando todo elemento de A também está em B, e subconjunto próprio quando, além disso, A ≠ B.',
    noSistema:
      'A regra residencial é uma inclusão: T(a) ⊆ {residência}. Na tela Operações, o sistema diz quando uma área está contida em outra; o entorno da Fatec, por exemplo, está contido no raio de 1 km em volta dela.',
    link: { para: '/operacoes?a=1&b=2&op=interseccao', rotulo: 'Comparar duas áreas' },
    figura: 'subconjunto',
    funcoes: ['subconjunto', 'subconjunto_proprio'],
  },
  {
    id: 'partes',
    titulo: 'Conjunto das partes',
    referencia: '§4.3, eq. (12)',
    formulas: ['P(T) = { X | X ⊆ T }', '#P(T)# = 2^3 = 8'],
    leitura:
      'O conjunto das partes reúne todos os subconjuntos, do vazio ao próprio conjunto. Com três tipos de estabelecimento, são 2³ = 8 combinações.',
    noSistema:
      'Os 8 subconjuntos de T = {escola, indústria, residência} são todas as combinações de tipos que uma área pode conter. A regra leva essas 8 combinações a só 5 classificações. A tabela abaixo é calculada pela própria regra do backend, e um teste automático percorre as 8 linhas.',
    figura: 'partes',
    funcoes: ['conjunto_das_partes'],
  },
  {
    id: 'uniao',
    titulo: 'União',
    referencia: '§4.4, eq. (13)',
    formulas: ['x ∈ A ∪ B ↔ x ∈ A ∨ x ∈ B'],
    leitura: 'A união reúne os elementos que estão em A, em B ou nos dois.',
    noSistema:
      'As classes de um ponto são a união das classes das áreas que o contêm. Na tela Operações, a união de duas áreas é feita com o overlay do GeoPandas, que devolve as três regiões do diagrama de Venn.',
    link: { para: '/operacoes?op=uniao', rotulo: 'Unir duas áreas' },
    figura: 'uniao',
    funcoes: ['classes_do_ponto', 'uniao'],
  },
  {
    id: 'interseccao',
    titulo: 'Intersecção',
    referencia: '§4.5, eq. (14)',
    formulas: ['x ∈ A ∩ B ↔ x ∈ A ∧ x ∈ B'],
    leitura: 'A intersecção guarda só os elementos que estão em A e em B ao mesmo tempo.',
    noSistema:
      'O material apresenta a junção (join) como uma intersecção entre tabelas; a junção espacial do GeoPandas é a mesma ideia com geometrias. É ela que decide em que áreas cada estabelecimento está, e o overlay acha as sobreposições A ∩ B, onde uma área industrial pode ser também escolar.',
    link: { para: '/operacoes?op=interseccao', rotulo: 'Cruzar duas áreas' },
    figura: 'interseccao',
    funcoes: ['interseccao'],
  },
  {
    id: 'diferenca',
    titulo: 'Diferença',
    referencia: '§4.6, eq. (15) e Figura 21',
    formulas: ['x ∈ A − B ↔ x ∈ A ∧ x ∉ B', 'A Δ B = ( A − B ) ∪ ( B − A )'],
    leitura:
      'A diferença A − B guarda o que está em A e não está em B. A diferença simétrica junta as duas diferenças.',
    noSistema:
      'A diferença dá a parte de uma área que fica fora da outra. Como o material faz com o merge do pandas, os estabelecimentos que não estão em nenhuma área saem de uma junção à esquerda, guardando só as linhas que ficaram sem par.',
    link: { para: '/operacoes?op=diferenca', rotulo: 'Subtrair uma área de outra' },
    figura: 'diferenca',
    funcoes: ['diferenca', 'diferenca_simetrica', 'fora_de_todas'],
  },
  {
    id: 'produto',
    titulo: 'Produto cartesiano',
    referencia: '§4.7, eq. (16)',
    formulas: ['E × A = { ( e , a ) | e ∈ E ∧ a ∈ A }'],
    leitura:
      'O produto cartesiano forma todos os pares ordenados com o primeiro elemento de E e o segundo de A.',
    noSistema:
      'A junção espacial é uma seleção sobre o produto: dos |E|·|A| pares (estabelecimento, área), ficam só os que têm e ∈ a. O código faz isso de dois jeitos, pelo merge com how="cross" e pelo sjoin, e um teste confere que os dois dão o mesmo resultado.',
    link: { para: '/operacoes#produto', rotulo: 'Ver os pares na tela Operações' },
    figura: 'produto',
    funcoes: ['produto', 'juncao_pelo_produto'],
  },
];
