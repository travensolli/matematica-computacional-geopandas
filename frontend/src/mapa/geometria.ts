import L, { type LatLngBoundsExpression } from 'leaflet';
import type { FeatureArea } from '../api/esquemas';

/** Retângulo que envolve as áreas, para enquadrar o mapa nelas. */
export function limitesDasAreas(areas: FeatureArea[]): LatLngBoundsExpression | null {
  if (areas.length === 0) return null;
  const limites = L.geoJSON(areas.map((a) => a.geometry) as never).getBounds();
  return limites.isValid() ? limites : null;
}
