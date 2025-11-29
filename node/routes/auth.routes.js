const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getMemory, getProvider, getConnection } = require('../db');
const config = require('../config');

const router = Router();

router.post(
  '/auth/register',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('rol').isIn(['admin', 'operador', 'visor']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
    const { email, password, rol } = req.body;
    if (getProvider() !== 'memory') return res.status(501).json({ mensaje: 'Registro solo disponible en modo memoria' });
    const mem = getMemory();
    if (mem.users.find(u => u.email === email)) return res.status(409).json({ mensaje: 'Usuario ya existe' });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), email, password: hash, rol };
    mem.users.push(user);
    res.status(201).json({ id: user.id, email: user.email, rol: user.rol });
  }
);

router.post(
  '/auth/login',
  body('email').isEmail(),
  body('password').isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
    const { email, password } = req.body;
    if (getProvider() === 'memory') {
      const mem = getMemory();
      const user = mem.users.find(u => u.email === email);
      if (!user) return res.status(401).json({ mensaje: 'Credenciales inválidas' });
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ mensaje: 'Credenciales inválidas' });
      const token = jwt.sign({ sub: user.id, email: user.email, rol: user.rol }, config.jwtSecret, { expiresIn: '8h' });
      return res.json({ token, rol: user.rol });
    }
    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .input('email', email)
        .query("SELECT TOP 1 Id, Email, PasswordHash, Rol FROM dbo.Usuarios WHERE Email = @email");
      const row = result.recordset[0];
      if (!row) return res.status(401).json({ mensaje: 'Credenciales inválidas' });
      const ok = await bcrypt.compare(password, row.PasswordHash);
      if (!ok) return res.status(401).json({ mensaje: 'Credenciales inválidas' });
      const token = jwt.sign({ sub: row.Id, email: row.Email, rol: row.Rol }, config.jwtSecret, { expiresIn: '8h' });
      res.json({ token, rol: row.Rol });
    } catch (e) {
      res.status(500).json({ mensaje: 'Error de servidor' });
    }
  }
);

router.post('/auth/reset-request', body('email').isEmail(), (req, res) => {
  const { email } = req.body;
  res.json({ mensaje: 'Solicitud recibida', email });
});

router.post('/auth/reset-confirm', body('token').isString(), body('newPassword').isLength({ min: 8 }), async (req, res) => {
  const { token, newPassword } = req.body;
  res.json({ mensaje: 'Cambio de contraseña simulado' });
});

module.exports = router;
