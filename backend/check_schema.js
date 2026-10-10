require('dotenv').config();
const { sql, connectDB } = require('./db.js');
connectDB().then(async pool => {
  const tables = ['AppUser', 'Hospital', 'TeleradiologyCompany'];
  for (const t of tables) {
    const res = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${t}'`);
    console.log(t, res.recordset.map(r => r.COLUMN_NAME));
  }
  process.exit(0);
});
