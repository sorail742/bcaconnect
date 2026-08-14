import http from 'k6/http';
import { check } from 'k6';

/**
 * Script de fumée — prouve que k6 s'exécute (via l'image Docker officielle,
 * l'installeur MSI natif ayant échoué avec le code 1603 sur cette machine —
 * probablement un besoin d'élévation). Les vrais scénarios (Phase 4) ciblent
 * la stack docker-compose locale, jamais la production.
 */
export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL || 'http://localhost:5000'}/api/health`);
  check(res, { 'status is 200': (r) => r.status === 200 });
}
