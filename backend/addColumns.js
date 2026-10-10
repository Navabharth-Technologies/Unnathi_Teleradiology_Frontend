require('dotenv').config();
const { sql, connectDB } = require('./db.js');

const addMissingColumns = async () => {
  let pool;
  try {
    pool = await connectDB();
    console.log('Connected to DB. Adding missing columns...');

    const hospitalColumns = [
      { name: 'DicomAeTitle', type: 'NVARCHAR(255)' },
      { name: 'DicomCallingAe', type: 'NVARCHAR(255)' },
      { name: 'DicomIp', type: 'NVARCHAR(255)' },
      { name: 'DicomPort', type: 'NVARCHAR(50)' },
      { name: 'UploadMethods', type: 'NVARCHAR(MAX)' }, // JSON
      { name: 'DefaultReportingProvider', type: 'NVARCHAR(255)' },
      { name: 'DefaultTatProfile', type: 'NVARCHAR(255)' },
      { name: 'ReportBranding', type: 'NVARCHAR(MAX)' },
      { name: 'BillingProfile', type: 'NVARCHAR(255)' },
      { name: 'SupportedModalities', type: 'NVARCHAR(MAX)' }, // JSON
      { name: 'VerifierId', type: 'NVARCHAR(100)' },
      { name: 'Subscription', type: 'NVARCHAR(MAX)' }, // JSON
      { name: 'ReportingWorkflow', type: 'NVARCHAR(MAX)' }, // JSON
      { name: 'Branding', type: 'NVARCHAR(MAX)' }, // JSON
      { name: 'ModalityCommissions', type: 'NVARCHAR(MAX)' }, // JSON
      { name: 'AccountType', type: 'NVARCHAR(100)' }
    ];

    for (const col of hospitalColumns) {
      try {
        await pool.request().query(`
          IF NOT EXISTS (
            SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Hospital' AND COLUMN_NAME = '${col.name}'
          )
          BEGIN
            ALTER TABLE Hospital ADD ${col.name} ${col.type};
          END
        `);
      } catch (err) {
        console.log(`Failed to add column ${col.name} to Hospital:`, err.message);
      }
    }
    console.log('Updated Hospital table.');

    // Users (AppUser) table already had most of them based on the earlier schema check, 
    // but just to be sure if anything is missing.
    // 'LoginMode', 'Password', 'MfaEnabled', 'AllowedCentres' were ALREADY present in the previous check.
    // So AppUser should be fine.

    // Let's also check TeleradiologyCompany just in case
    const companyColumns = [
      { name: 'AdminEmail', type: 'NVARCHAR(255)' },
      { name: 'AdminMobile', type: 'NVARCHAR(100)' },
      { name: 'AdminFullName', type: 'NVARCHAR(255)' }
    ];
    for (const col of companyColumns) {
      try {
        await pool.request().query(`
          IF NOT EXISTS (
            SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'TeleradiologyCompany' AND COLUMN_NAME = '${col.name}'
          )
          BEGIN
            ALTER TABLE TeleradiologyCompany ADD ${col.name} ${col.type};
          END
        `);
      } catch (err) {
        console.log(`Failed to add column ${col.name} to TeleradiologyCompany:`, err.message);
      }
    }
    console.log('Updated TeleradiologyCompany table.');

    console.log('Database successfully upgraded!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (pool) await pool.close();
  }
};

addMissingColumns();
