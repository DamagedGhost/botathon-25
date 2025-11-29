const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// Importar rutas
const voluntariosRoutes = require('./routes/voluntarios.routes');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // Permite conexiones externas
app.use(morgan('dev')); // Muestra logs en consola
app.use(express.json()); 

// Rutas
app.use('/api', voluntariosRoutes);

// Iniciar
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 Prueba tu conexión aquí: http://localhost:${PORT}/api/test-conexion`);
});