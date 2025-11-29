const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { getMemory } = require('../db');
const { body, validationResult } = require('express-validator');

const router = Router();

router.get('/institutos', auth(['admin','operador','visor']), (req, res) => {
  const mem = getMemory();
  res.json({ total: mem.institutes.length, items: mem.institutes });
});

router.post(
  '/institutos',
  auth(['admin','operador']),
  body('nombre').isString(),
  body('region').isString(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
    const mem = getMemory();
    const id = Date.now().toString();
    const item = { id, ...req.body };
    mem.institutes.push(item);
    res.status(201).json(item);
  }
);

router.put('/institutos/:id', auth(['admin','operador']), (req, res) => {
  const mem = getMemory();
  const idx = mem.institutes.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ mensaje: 'No encontrado' });
  mem.institutes[idx] = { ...mem.institutes[idx], ...req.body };
  res.json(mem.institutes[idx]);
});

router.delete('/institutos/:id', auth(['admin']), (req, res) => {
  const mem = getMemory();
  const idx = mem.institutes.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ mensaje: 'No encontrado' });
  mem.institutes.splice(idx, 1);
  res.status(204).end();
});

module.exports = router;
