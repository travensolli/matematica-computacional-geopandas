import { http, HttpResponse } from 'msw';
import {
  AREAS,
  CONSULTA_SOBREPOSICAO,
  ESTABELECIMENTOS,
  MUNICIPIO,
  PARTES,
  PRODUTO,
  SOBREPOSICOES,
  TRECHOS,
} from './dados';

export const handlers = [
  http.get('/api/saude', () =>
    HttpResponse.json({ status: 'ok', areas: 5, estabelecimentos: 2, municipio: true }),
  ),
  http.get('/api/areas', () => HttpResponse.json(AREAS)),
  http.get('/api/estabelecimentos', () => HttpResponse.json(ESTABELECIMENTOS)),
  http.get('/api/sobreposicoes', () => HttpResponse.json(SOBREPOSICOES)),
  http.get('/api/municipio', () => HttpResponse.json(MUNICIPIO)),
  http.get('/api/consulta', () => HttpResponse.json(CONSULTA_SOBREPOSICAO)),
  http.get('/api/conjuntos/partes', () => HttpResponse.json(PARTES)),
  http.get('/api/conjuntos/produto', () => HttpResponse.json(PRODUTO)),
  http.get('/api/teoria/trechos', () => HttpResponse.json(TRECHOS)),
];
