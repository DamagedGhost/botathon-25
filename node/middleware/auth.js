const jwt = require('jsonwebtoken');
const config = require('../config');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ mensaje: 'No autorizado' });
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      req.user = payload;
      if (requiredRoles.length && !requiredRoles.includes(payload.rol)) {
        return res.status(403).json({ mensaje: 'Acceso denegado' });
      }
      next();
    } catch (e) {
      res.status(401).json({ mensaje: 'Token inválido' });
    }
  };
}

module.exports = { auth };
