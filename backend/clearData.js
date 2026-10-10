require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

const clearData = async () => {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    console.log('Connected to DB');

    // Disable all constraints
    console.log('Disabling foreign key constraints...');
    await pool.request().query('EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"');

    // Delete data from all tables
    console.log('Deleting all data from all tables...');
    await pool.request().query('EXEC sp_MSforeachtable "DELETE FROM ?"');

    // Enable all constraints
    console.log('Re-enabling foreign key constraints...');
    await pool.request().query('EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"');

    console.log('Successfully cleared all data from all tables!');
  } catch (err) {
    console.error('Error clearing data:', err);
  } finally {
    if (pool) await pool.close();
  }
};

clearData();
