const { Router } = require('express');
const { getConnection, getProvider, getMemory } = require('../db');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = Router();

// GET: Test de conexión (Ruta: /api/test-conexion)
router.get('/test-conexion', async (req, res) => {
    try {
        if (getProvider() === 'sqlserver') {
            const pool = await getConnection();
            const result = await pool.request().query('SELECT SUSER_NAME() as Usuario, DB_NAME() as BaseDatos, @@VERSION as Version');
            res.json({
                estado: 'Exitoso 🟢',
                mensaje: 'Conexión a SQL Server establecida',
                datos_conexion: {
                    usuario: result.recordset[0].Usuario,
                    base_datos: result.recordset[0].BaseDatos,
                    version: result.recordset[0].Version
                }
            });
        } else {
            const mem = getMemory();
            res.json({
                estado: 'Memoria 🟡',
                mensaje: 'Proveedor de datos en memoria activo',
                resumen: {
                    voluntarios: mem.volunteers.length,
                    institutos: mem.institutes.length,
                    campañas: mem.campaigns.length
                }
            });
        }
    } catch (error) {
        res.status(500).json({ estado: 'Error 🔴', mensaje: 'Fallo de conexión', detalle_tecnico: error.message });
    }
});

router.get('/voluntarios', auth(['admin', 'operador', 'visor']), (req, res) => {
  const mem = getMemory();
  const {
    nombre,
    region,
    tipo,
    habilidad,
    disponibilidad,
    campaña,
    año,
  } = req.query;
  let data = [...mem.volunteers];
  if (nombre) data = data.filter(v => v.nombre?.toLowerCase().includes(String(nombre).toLowerCase()));
  if (region) data = data.filter(v => v.region === region);
  if (tipo) data = data.filter(v => v.tipoVoluntariado === tipo);
  if (habilidad) data = data.filter(v => (v.habilidades || []).map(h => h.toLowerCase()).includes(String(habilidad).toLowerCase()));
  if (disponibilidad) data = data.filter(v => v.disponibilidad === disponibilidad);
  if (campaña) data = data.filter(v => (v.campañas || []).some(c => c.nombre === campaña && (!año || String(c.año) === String(año))));
  res.json({ total: data.length, items: data });
});

router.post(
  '/voluntarios',
  auth(['admin', 'operador']),
  body('email').isEmail(),
  body('nombre').isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
    const mem = getMemory();
    const exists = mem.volunteers.find(v => v.email === req.body.email);
    if (exists) return res.status(409).json({ mensaje: 'Voluntario ya existe' });
    const id = Date.now().toString();
    const item = { id, ...req.body };
    mem.volunteers.push(item);
    res.status(201).json(item);
  }
);

router.get('/voluntarios/:id', auth(['admin', 'operador', 'visor']), (req, res) => {
  const mem = getMemory();
  const item = mem.volunteers.find(v => v.id === req.params.id);
  if (!item) return res.status(404).json({ mensaje: 'No encontrado' });
  res.json(item);
});

router.put('/voluntarios/:id', auth(['admin', 'operador']), (req, res) => {
  const mem = getMemory();
  const idx = mem.volunteers.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ mensaje: 'No encontrado' });
  mem.volunteers[idx] = { ...mem.volunteers[idx], ...req.body };
  res.json(mem.volunteers[idx]);
});

router.delete('/voluntarios/:id', auth(['admin']), (req, res) => {
  const mem = getMemory();
  const idx = mem.volunteers.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ mensaje: 'No encontrado' });
  mem.volunteers.splice(idx, 1);
  res.status(204).end();
});

router.post('/voluntarios/import', auth(['admin', 'operador']), (req, res) => {
  const mem = getMemory();
  const arr = Array.isArray(req.body) ? req.body : [];
  for (const v of arr) {
    const id = v.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const exists = mem.volunteers.find(x => x.email === v.email);
    if (exists) {
      Object.assign(exists, { ...v, id: exists.id });
    } else {
      mem.volunteers.push({ ...v, id });
    }
  }
  res.json({ total: mem.volunteers.length });
});

router.get('/voluntarios/match', auth(['admin','operador','visor']), (req, res) => {
  const mem = getMemory();
  const skills = String(req.query.skills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  const region = req.query.region;
  const disponibilidad = req.query.disponibilidad;
  const limit = Number(req.query.limit || 20);
  const score = v => {
    let s = 0;
    if (region && v.region === region) s += 3;
    if (disponibilidad && v.disponibilidad === disponibilidad) s += 2;
    const hs = (v.habilidades || []).map(h => String(h).toLowerCase());
    for (const k of skills) if (hs.includes(k)) s += 4;
    return s;
  };
  const ranked = mem.volunteers
    .map(v => ({ v, s: score(v) }))
    .filter(x => x.s > 0)
    .sort((a,b) => b.s - a.s)
    .slice(0, limit)
    .map(x => ({ ...x.v, matchScore: x.s }));
  res.json({ total: ranked.length, items: ranked });
});

module.exports = router;
