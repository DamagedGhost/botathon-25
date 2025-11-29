const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { getMemory } = require('../db');
const multer = require('multer');
const { parse } = require('csv-parse');
const xlsx = require('xlsx');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function upsertVolunteer(mem, v) {
  const exists = mem.volunteers.find(x => x.email === v.email);
  if (exists) Object.assign(exists, { ...v, id: exists.id });
  else mem.volunteers.push({ id: v.id || Date.now().toString(), ...v });
}

router.post('/import/csv', auth(['admin','operador']), upload.single('file'), async (req, res) => {
  const mem = getMemory();
  const file = req.file;
  if (!file) return res.status(400).json({ mensaje: 'Archivo requerido' });
  const records = [];
  await new Promise((resolve, reject) => {
    parse(file.buffer, { columns: true, skip_empty_lines: true }, (err, output) => {
      if (err) return reject(err);
      for (const row of output) records.push(row);
      resolve();
    });
  });
  for (const r of records) {
    const v = {
      email: r.email,
      nombre: r.nombre,
      telefono: r.telefono,
      region: r.region,
      tipoVoluntariado: r.tipoVoluntariado,
      habilidades: (r.habilidades || '').split('|').filter(Boolean),
      disponibilidad: r.disponibilidad,
    };
    upsertVolunteer(mem, v);
  }
  res.json({ total: mem.volunteers.length });
});

router.post('/import/xlsx', auth(['admin','operador']), upload.single('file'), (req, res) => {
  const mem = getMemory();
  const file = req.file;
  if (!file) return res.status(400).json({ mensaje: 'Archivo requerido' });
  const wb = xlsx.read(file.buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws);
  for (const r of rows) {
    const v = {
      email: r.email,
      nombre: r.nombre,
      telefono: r.telefono,
      region: r.region,
      tipoVoluntariado: r.tipoVoluntariado,
      habilidades: (r.habilidades || '').split('|').filter(Boolean),
      disponibilidad: r.disponibilidad,
    };
    upsertVolunteer(mem, v);
  }
  res.json({ total: mem.volunteers.length });
});

router.post('/rpa/upsert-volunteers', auth(['admin','operador']), (req, res) => {
  const mem = getMemory();
  const arr = Array.isArray(req.body) ? req.body : [];
  for (const v of arr) upsertVolunteer(mem, v);
  res.json({ total: mem.volunteers.length });
});

router.post('/rpa/prepare-email', auth(['admin','operador']), (req, res) => {
  const mem = getMemory();
  const { subject, body, filter } = req.body || {};
  let targets = [...mem.volunteers];
  if (filter?.region) targets = targets.filter(v => v.region === filter.region);
  if (filter?.skills?.length) {
    const ks = filter.skills.map(s => String(s).toLowerCase());
    targets = targets.filter(v => (v.habilidades||[]).map(h => String(h).toLowerCase()).some(h => ks.includes(h)));
  }
  if (filter?.disponibilidad) targets = targets.filter(v => v.disponibilidad === filter.disponibilidad);
  const emails = targets.map(v => v.email).filter(Boolean);
  res.json({ preparado: true, total_destinatarios: emails.length, subject, body, destinatarios: emails });
});

module.exports = router;
