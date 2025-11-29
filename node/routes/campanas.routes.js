const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { getMemory } = require('../db');
const { body, validationResult } = require('express-validator');

const router = Router();

router.get('/campanas', auth(['admin','operador','visor']), (req, res) => {
  const mem = getMemory();
  res.json({ total: mem.campaigns.length, items: mem.campaigns });
});

router.post(
  '/campanas',
  auth(['admin','operador']),
  body('nombre').isString(),
  body('vigencia').isString(),
  body('anio').isInt(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
    const mem = getMemory();
    const id = Date.now().toString();
    const item = { id, ...req.body };
    mem.campaigns.push(item);
    res.status(201).json(item);
  }
);

router.put('/campanas/:id', auth(['admin','operador']), (req, res) => {
  const mem = getMemory();
  const idx = mem.campaigns.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ mensaje: 'No encontrado' });
  mem.campaigns[idx] = { ...mem.campaigns[idx], ...req.body };
  res.json(mem.campaigns[idx]);
});

router.delete('/campanas/:id', auth(['admin']), (req, res) => {
  const mem = getMemory();
  const idx = mem.campaigns.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ mensaje: 'No encontrado' });
  mem.campaigns.splice(idx, 1);
  res.status(204).end();
});

module.exports = router;
