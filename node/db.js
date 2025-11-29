const sql = require('mssql');

const dbSettings = {
    user: 'sa',
    password: 'Admin123', // Asegúrate que esta sea la clave real del servidor
    server: '18.214.144.253',
    database: 'master', // Empezamos con 'master' para asegurar que conecte sí o sí
    options: {
        encrypt: false, // Importante para IPs directas o servidores sin SSL configurado
        trustServerCertificate: true, // OBLIGATORIO para AWS/Azure sin certificados de pago
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

async function getConnection() {
    try {
        const pool = await sql.connect(dbSettings);
        return pool;
    } catch (error) {
        // Este log es vital para saber por qué falla
        console.error('🔴 Error FATAL de conexión a SQL Server:', error);
        throw error;
    }
}

module.exports = { getConnection, sql };