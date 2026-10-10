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

const dropTables = async () => {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    console.log('Connected to DB');
    
    const tablesToDrop = [
      'Sites', 'Hospitals', 'Users', 'Radiologists', 
      'Patients', 'Studies', 'Invoices', 'Templates', 
      'Modalities', 'CustomRoles'
    ];

    for (const table of tablesToDrop) {
      console.log(`Dropping table ${table}...`);
      await pool.request().query(`
        IF OBJECT_ID('dbo.${table}', 'U') IS NOT NULL
        DROP TABLE dbo.${table};
      `);
      console.log(`Dropped ${table}`);
    }

    console.log('Finished dropping dummy tables!');
  } catch (err) {
    console.error(err);
  } finally {
    if (pool) await pool.close();
  }
};

dropTables();
