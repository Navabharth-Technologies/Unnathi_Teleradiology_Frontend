require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sql, connectDB } = require('./db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// Example endpoint to test DB connection
app.get('/api/db-test', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT @@version as version');
    res.json({ success: true, dbVersion: result.recordset[0].version });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Map frontend endpoints to actual SQL table names
const routeToTableMap = {
  'sites': 'TeleradiologyCompany',
  'hospitals': 'Hospital',
  'users': 'AppUser',
  'radiologists': 'Radiologist',
  'patients': 'Patient',
  'studies': 'Study',
  'invoices': 'Invoice',
  'templates': 'Templates',
  'modalities': 'Modalities',
  'customroles': 'CustomRoles'
};

Object.entries(routeToTableMap).forEach(([routeName, tableName]) => {
  const formatRow = (row) => {
    if (!row) return row;
    const obj = {};
    for (const key in row) {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      let val = row[key];
      try {
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          val = JSON.parse(val);
        }
      } catch (e) {}
      obj[camelKey] = val;
    }
    return obj;
  };

  // GET all
  app.get(`/api/${routeName}`, async (req, res) => {
    try {
      const pool = await connectDB();
      const result = await pool.request().query(`SELECT * FROM ${tableName}`);
      res.json(result.recordset.map(formatRow));
    } catch (err) {
      console.error(`Error GET /api/${routeName}:`, err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET by ID
  app.get(`/api/${routeName}/:id`, async (req, res) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('id', sql.NVarChar, req.params.id)
        .query(`SELECT * FROM ${tableName} WHERE Id = @id`);
      res.json(formatRow(result.recordset[0]));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  app.post(`/api/${routeName}`, async (req, res) => {
    try {
      const pool = await connectDB();
      const colRes = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`);
      const validColumns = colRes.recordset.map(r => r.COLUMN_NAME.toLowerCase());
      
      const body = req.body;
      const filteredKeys = Object.keys(body).filter(k => validColumns.includes(k.toLowerCase()));
      const keys = filteredKeys;
      
      let query = `INSERT INTO ${tableName} (`;
      query += keys.join(', ') + ') VALUES (';
      
      const request = pool.request();
      keys.forEach((key, index) => {
        query += `@${key}`;
        if (index < keys.length - 1) query += ', ';
        
        let val = body[key];
        if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        request.input(key, val);
      });
      query += ')';

      await request.query(query);
      res.status(201).json(body);
    } catch (err) {
      console.error(`Error POST /api/${routeName}:`, err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  app.put(`/api/${routeName}/:id`, async (req, res) => {
    try {
      const pool = await connectDB();
      const colRes = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`);
      const validColumns = colRes.recordset.map(r => r.COLUMN_NAME.toLowerCase());

      const body = req.body;
      const keys = Object.keys(body).filter(k => k.toLowerCase() !== 'id' && validColumns.includes(k.toLowerCase()));
      
      let query = `UPDATE ${tableName} SET `;
      
      const request = pool.request();
      request.input('id', sql.NVarChar, req.params.id);
      
      keys.forEach((key, index) => {
        query += `${key} = @${key}`;
        if (index < keys.length - 1) query += ', ';
        
        let val = body[key];
        if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        request.input(key, val);
      });
      
      query += ' WHERE Id = @id';

      await request.query(query);
      res.json({ id: req.params.id, ...body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  app.delete(`/api/${routeName}/:id`, async (req, res) => {
    try {
      const pool = await connectDB();
      await pool.request()
        .input('id', sql.NVarChar, req.params.id)
        .query(`DELETE FROM ${tableName} WHERE Id = @id`);
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
});
