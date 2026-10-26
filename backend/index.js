require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sql, connectDB } = require('./db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

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
  'customroles': 'CustomRoles',
  'wallet-transactions': 'WalletTransaction',
  'postpaid-settlements': 'PostpaidSettlement'
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

  // POST create or upsert
  app.post(`/api/${routeName}`, async (req, res) => {
    try {
      const pool = await connectDB();
      const colRes = await pool.request().query(`SELECT COLUMN_NAME, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`);
      const validColsMap = {};
      colRes.recordset.forEach(r => {
        validColsMap[r.COLUMN_NAME.toLowerCase()] = {
          name: r.COLUMN_NAME,
          isNullable: r.IS_NULLABLE === 'YES'
        };
      });

      const body = req.body;
      const recordId = body.id || body.Id;

      // Check if record already exists for UPSERT
      let exists = false;
      if (recordId) {
        const checkRes = await pool.request()
          .input('checkId', sql.NVarChar, recordId)
          .query(`SELECT Id FROM ${tableName} WHERE Id = @checkId`);
        exists = checkRes.recordset.length > 0;
      }

      if (exists) {
        // UPDATE existing record
        const updateKeys = Object.keys(body).filter(k => {
          const lk = k.toLowerCase();
          return lk !== 'id' && validColsMap[lk];
        });

        if (updateKeys.length > 0) {
          const request = pool.request();
          request.input('id', sql.NVarChar, recordId);
          let query = `UPDATE ${tableName} SET `;

          updateKeys.forEach((key, index) => {
            const colInfo = validColsMap[key.toLowerCase()];
            const actualCol = colInfo.name;
            query += `${actualCol} = @${key}`;
            if (index < updateKeys.length - 1) query += ', ';

            let val = body[key];
            if (val === '' || val === 'null' || val === 'undefined' || val === undefined) {
              val = colInfo.isNullable ? null : (val || '');
            } else if (typeof val === 'object' && val !== null) {
              val = JSON.stringify(val);
            }
            request.input(key, val);
          });

          query += ' WHERE Id = @id';
          await request.query(query);
        }
        return res.json(body);
      }

      // INSERT new record
      const insertKeys = Object.keys(body).filter(k => validColsMap[k.toLowerCase()]);
      const request = pool.request();
      let query = `INSERT INTO ${tableName} (`;

      const colNames = insertKeys.map(k => validColsMap[k.toLowerCase()].name);
      query += colNames.join(', ') + ') VALUES (';

      insertKeys.forEach((key, index) => {
        const colInfo = validColsMap[key.toLowerCase()];
        query += `@${key}`;
        if (index < insertKeys.length - 1) query += ', ';

        let val = body[key];
        if (val === '' || val === 'null' || val === 'undefined' || val === undefined) {
          val = colInfo.isNullable ? null : (val || '');
        } else if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
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

  // PUT update or upsert
  app.put(`/api/${routeName}/:id`, async (req, res) => {
    try {
      const pool = await connectDB();
      const colRes = await pool.request().query(`SELECT COLUMN_NAME, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`);
      const validColsMap = {};
      colRes.recordset.forEach(r => {
        validColsMap[r.COLUMN_NAME.toLowerCase()] = {
          name: r.COLUMN_NAME,
          isNullable: r.IS_NULLABLE === 'YES'
        };
      });

      const body = { ...req.body, id: req.params.id };
      const recordId = req.params.id;

      // Check if record exists
      const checkRes = await pool.request()
        .input('checkId', sql.NVarChar, recordId)
        .query(`SELECT Id FROM ${tableName} WHERE Id = @checkId`);

      if (checkRes.recordset.length === 0) {
        // Record does not exist, INSERT
        // Ensure all non-nullable columns have values
        Object.keys(validColsMap).forEach((colLower) => {
          const colInfo = validColsMap[colLower];
          if (!colInfo.isNullable && body[colInfo.name] === undefined && body[colLower] === undefined) {
            if (colLower === 'patientid') body[colInfo.name] = body.patientId || `p${Date.now()}`;
            else if (colLower === 'casenumber') body[colInfo.name] = `CAS-${Date.now().toString().slice(-5)}`;
            else if (colLower === 'accessionnumber') body[colInfo.name] = `ACC-${Date.now().toString().slice(-5)}`;
            else if (colLower === 'hospitalid') body[colInfo.name] = 'h1';
            else body[colInfo.name] = '';
          }
        });

        const insertKeys = Object.keys(body).filter(k => validColsMap[k.toLowerCase()]);
        const request = pool.request();
        let query = `INSERT INTO ${tableName} (`;
        const colNames = insertKeys.map(k => validColsMap[k.toLowerCase()].name);
        query += colNames.join(', ') + ') VALUES (';

        insertKeys.forEach((key, index) => {
          const colInfo = validColsMap[key.toLowerCase()];
          query += `@${key}`;
          if (index < insertKeys.length - 1) query += ', ';

          let val = body[key];
          if (val === '' || val === 'null' || val === 'undefined' || val === undefined) {
            val = colInfo.isNullable ? null : (val || '');
          } else if (typeof val === 'object' && val !== null) {
            val = JSON.stringify(val);
          }
          request.input(key, val);
        });
        query += ')';

        await request.query(query);
        return res.json(body);
      }

      // UPDATE
      const keys = Object.keys(body).filter(k => k.toLowerCase() !== 'id' && validColsMap[k.toLowerCase()]);
      if (keys.length > 0) {
        let query = `UPDATE ${tableName} SET `;
        const request = pool.request();
        request.input('id', sql.NVarChar, recordId);

        keys.forEach((key, index) => {
          const colInfo = validColsMap[key.toLowerCase()];
          const actualCol = colInfo.name;
          query += `${actualCol} = @${key}`;
          if (index < keys.length - 1) query += ', ';

          let val = body[key];
          if (val === '' || val === 'null' || val === 'undefined' || val === undefined) {
            val = colInfo.isNullable ? null : (val || '');
          } else if (typeof val === 'object' && val !== null) {
            val = JSON.stringify(val);
          }
          request.input(key, val);
        });

        query += ' WHERE Id = @id';
        await request.query(query);
      }
      res.json({ id: req.params.id, ...body });
    } catch (err) {
      console.error(`Error PUT /api/${routeName}:`, err.message);
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
  const pool = await connectDB();
  try {
    // Ensure all tables do not block on foreign keys
    await pool.request().query('EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"');
  } catch (e) {
    console.warn('Could not set NOCHECK constraints:', e.message);
  }
});
