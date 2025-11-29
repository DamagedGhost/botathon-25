const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { getMemory } = require('../db');
const { coordForRegion } = require('../utils/geo');

const router = Router();

router.get('/metrics/voluntarios/count', auth(['admin','operador','visor']), (req, res) => {
  const mem = getMemory();
  res.json({ total: mem.volunteers.length });
});

router.get('/metrics/voluntarios/heatmap', auth(['admin','operador','visor']), (req, res) => {
  const mem = getMemory();
  const counts = {};
  for (const v of mem.volunteers) {
    counts[v.region] = (counts[v.region] || 0) + 1;
  }
  const points = Object.entries(counts).map(([region, count]) => ({
    region,
    count,
    ...coordForRegion(region),
  }));
  res.json({ points });
});

router.get('/metrics/participacion/timeline', auth(['admin','operador','visor']), (req, res) => {
  const mem = getMemory();
  const series = {};
  for (const v of mem.volunteers) {
    for (const c of v.campañas || []) {
      const key = `${c.año}-${String(c.mes || 1).padStart(2,'0')}`;
      series[key] = (series[key] || 0) + 1;
    }
  }
  const points = Object.entries(series).sort(([a],[b]) => a.localeCompare(b)).map(([period, value]) => ({ period, value }));
  res.json({ points });
});

router.get('/metrics/perfil/stats', auth(['admin','operador','visor']), (req, res) => {
  const mem = getMemory();
  const habilidades = {};
  const disponibilidad = {};
  for (const v of mem.volunteers) {
    for (const h of v.habilidades || []) {
      const key = String(h).toLowerCase();
      habilidades[key] = (habilidades[key] || 0) + 1;
    }
    const disp = v.disponibilidad || 'no definida';
    disponibilidad[disp] = (disponibilidad[disp] || 0) + 1;
  }
  res.json({ habilidades, disponibilidad });
});

router.get('/metrics/asistencia', auth(['admin','operador','visor']), (req, res) => {
  const mem = getMemory();
  let total = 0, asistencias = 0;
  for (const v of mem.volunteers) {
    for (const p of v.participaciones || []) {
      total += 1;
      if (p.asistio) asistencias += 1;
    }
  }
  const tasa = total ? asistencias / total : 0;
  res.json({ total_eventos: total, asistencias, tasa });
});

module.exports = router;
