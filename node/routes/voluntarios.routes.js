const { Router } = require('express');
const { getConnection } = require('../db');

const router = Router();

// GET: Test de conexión (Ruta: /api/test-conexion)
router.get('/test-conexion', async (req, res) => {
    try {
        const pool = await getConnection();
        // Consultas simples para validar quiénes somos en el server
        const result = await pool.request().query('SELECT SUSER_NAME() as Usuario, DB_NAME() as BaseDatos, @@VERSION as Version');
        
        res.json({
            estado: 'Exitoso 🟢',
            mensaje: '¡Node.js se conectó correctamente a SQL Server!',
            datos_conexion: {
                usuario: result.recordset[0].Usuario,
                base_datos: result.recordset[0].BaseDatos,
                version: result.recordset[0].Version
            }
        });
    } catch (error) {
        res.status(500).json({ 
            estado: 'Error 🔴', 
            mensaje: 'No se pudo conectar a SQL Server', 
            detalle_tecnico: error.message 
        });
    }
});

module.exports = router;