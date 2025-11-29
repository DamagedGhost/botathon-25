const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const voluntariosRoutes = require('./routes/voluntarios.routes');
const authRoutes = require('./routes/auth.routes');
const institutosRoutes = require('./routes/institutos.routes');
const campanasRoutes = require('./routes/campanas.routes');
const metricsRoutes = require('./routes/metrics.routes');
const importRoutes = require('./routes/import.routes');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // Permite conexiones externas
app.use(morgan('dev')); // Muestra logs en consola
app.use(express.json()); 

// Rutas
app.use('/api', voluntariosRoutes);
app.use('/api', authRoutes);
app.use('/api', institutosRoutes);
app.use('/api', campanasRoutes);
app.use('/api', metricsRoutes);
app.use('/api', importRoutes);

// Iniciar
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 Prueba tu conexión aquí: http://localhost:${PORT}/api/test-conexion`);
});

const { getProvider, getMemory } = require('./db');
const bcrypt = require('bcrypt');
(async () => {
  if (getProvider() === 'memory') {
    const mem = getMemory();
    if (!mem.users.find(u => u.email === 'admin@teleton.cl')) {
      const hash = await bcrypt.hash('Admin123!', 10);
      mem.users.push({ id: 'u-admin', email: 'admin@teleton.cl', password: hash, rol: 'admin' });
    }
    if (mem.volunteers.length === 0) {
      mem.volunteers.push(
        { id: 'v1', email: 'ana@ejemplo.cl', nombre: 'Ana', telefono: '111', region: 'Región Metropolitana', tipoVoluntariado: 'Apoyo', habilidades: ['primeros auxilios','música'], disponibilidad: 'fin de semana', campañas: [{ nombre: 'Teleton', año: 2022, mes: 11 }], participaciones: [{ campaña: 'Teleton 2022', asistio: true }] },
        { id: 'v2', email: 'luis@ejemplo.cl', nombre: 'Luis', telefono: '222', region: 'Región de Valparaíso', tipoVoluntariado: 'Logística', habilidades: ['lenguaje de señas'], disponibilidad: 'semanal', campañas: [{ nombre: 'Teleton', año: 2023, mes: 11 }], participaciones: [{ campaña: 'Teleton 2023', asistio: false }] },
        { id: 'v3', email: 'carla@ejemplo.cl', nombre: 'Carla', telefono: '333', region: 'Región del Biobío', tipoVoluntariado: 'Apoyo', habilidades: ['teatro'], disponibilidad: 'mensual', campañas: [{ nombre: 'Teleton', año: 2024, mes: 11 }], participaciones: [{ campaña: 'Teleton 2024', asistio: true }] }
      );
      mem.institutes.push(
        { id: 'i1', nombre: 'Instituto Santiago', region: 'Región Metropolitana' },
        { id: 'i2', nombre: 'Instituto Valparaíso', region: 'Región de Valparaíso' }
      );
      mem.campaigns.push(
        { id: 'c1', nombre: 'Teleton', vigencia: 'activa', anio: 2024 },
        { id: 'c2', nombre: 'Teleton', vigencia: 'histórica', anio: 2023 }
      );
    }
  }
})();

const path = require('path');
app.use('/', express.static(path.join(__dirname, 'public')));
