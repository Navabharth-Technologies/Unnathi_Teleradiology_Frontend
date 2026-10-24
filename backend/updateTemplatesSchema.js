require('dotenv').config();
const { connectDB } = require('./db.js');

async function updateTemplatesTable() {
  try {
    const pool = await connectDB();
    console.log('Connected to DB. Checking Templates columns...');

    const cols = [
      { name: 'HospitalId', type: 'NVARCHAR(100)' },
      { name: 'StudyName', type: 'NVARCHAR(255)' },
      { name: 'TemplateContent', type: 'NVARCHAR(MAX)' },
      { name: 'Price', type: 'DECIMAL(18,2)' },
      { name: 'IsActive', type: 'BIT DEFAULT 1' }
    ];

    for (const c of cols) {
      const q = "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Templates' AND COLUMN_NAME = '" + c.name + "') " +
                "BEGIN ALTER TABLE Templates ADD " + c.name + " " + c.type + "; END";
      await pool.request().query(q);
      console.log('Checked/Added column:', c.name);
    }

    const check = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Templates'");
    console.log('Updated Templates Columns:', check.recordset);
    process.exit(0);
  } catch (err) {
    console.error('Error updating Templates table:', err);
    process.exit(1);
  }
}

updateTemplatesTable();
