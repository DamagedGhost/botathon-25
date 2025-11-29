const sql = require('mssql');
const config = require('./config');

const memory = {
    volunteers: [],
    institutes: [],
    campaigns: [],
    participations: [],
    skills: [],
    users: [],
};

function getProvider() {
    return config.dbProvider;
}

function getMemory() {
    return memory;
}

async function getConnection() {
    if (getProvider() !== 'sqlserver') return null;
    const dbSettings = {
        user: config.sql.user,
        password: config.sql.password,
        server: config.sql.server,
        database: config.sql.database,
        options: config.sql.options,
        pool: config.sql.pool,
    };
    const pool = await sql.connect(dbSettings);
    return pool;
}

module.exports = { getConnection, sql, getProvider, getMemory };
