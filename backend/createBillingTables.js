require('dotenv').config();
const { sql, connectDB } = require('./db.js');

const createBillingTables = async () => {
  let pool;
  try {
    pool = await connectDB();
    console.log('Connected to MS SQL Server. Creating Prepaid/Postpaid tables...');

    // 1. WalletTransaction Table (for Prepaid recharges, auto-deductions, and refunds)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WalletTransaction' and xtype='U')
      BEGIN
        CREATE TABLE WalletTransaction (
          Id NVARCHAR(100) PRIMARY KEY,
          HospitalId NVARCHAR(100),
          SiteId NVARCHAR(100),
          Type NVARCHAR(50) DEFAULT 'Recharge',
          Amount DECIMAL(18,2) NOT NULL,
          BalanceBefore DECIMAL(18,2) DEFAULT 0.00,
          BalanceAfter DECIMAL(18,2) DEFAULT 0.00,
          PaymentMethod NVARCHAR(50) DEFAULT 'UPI',
          ReferenceId NVARCHAR(100),
          Remarks NVARCHAR(MAX),
          StudyId NVARCHAR(100),
          Status NVARCHAR(50) DEFAULT 'Completed',
          CreatedBy NVARCHAR(100),
          CreatedAt DATETIME DEFAULT GETDATE()
        );
        PRINT 'WalletTransaction table created successfully.';
      END
      ELSE
      BEGIN
        PRINT 'WalletTransaction table already exists.';
      END
    `);

    // 2. PostpaidSettlement Table (for Postpaid billing cycles: Daily, Weekly, 15 Days, Monthly)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PostpaidSettlement' and xtype='U')
      BEGIN
        CREATE TABLE PostpaidSettlement (
          Id NVARCHAR(100) PRIMARY KEY,
          HospitalId NVARCHAR(100),
          SiteId NVARCHAR(100),
          BillingCycle NVARCHAR(50) DEFAULT 'Monthly',
          PeriodStart DATETIME,
          PeriodEnd DATETIME,
          TotalStudies INT DEFAULT 0,
          TotalAmount DECIMAL(18,2) DEFAULT 0.00,
          TaxAmount DECIMAL(18,2) DEFAULT 0.00,
          GrandTotal DECIMAL(18,2) DEFAULT 0.00,
          Status NVARCHAR(50) DEFAULT 'Unpaid',
          DueDate DATETIME,
          PaidDate DATETIME,
          PaymentReference NVARCHAR(100),
          Notes NVARCHAR(MAX),
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE()
        );
        PRINT 'PostpaidSettlement table created successfully.';
      END
      ELSE
      BEGIN
        PRINT 'PostpaidSettlement table already exists.';
      END
    `);

    // 3. Seed initial wallet recharge transaction for Abc hospital if not exists
    const checkTx = await pool.request().query(`
      SELECT Id FROM WalletTransaction WHERE HospitalId = 'hosp_1791789809438'
    `);
    if (checkTx.recordset.length === 0) {
      await pool.request().query(`
        INSERT INTO WalletTransaction (
          Id, HospitalId, Type, Amount, BalanceBefore, BalanceAfter, PaymentMethod, ReferenceId, Remarks, Status, CreatedAt
        ) VALUES (
          'tx_' + CAST(DATEDIFF(s, '1970-01-01', GETUTCDATE()) AS NVARCHAR(50)),
          'hosp_1791789809438',
          'Recharge',
          100.00,
          0.00,
          100.00,
          'UPI',
          'UPI-REC-100',
          'Initial Wallet Recharge',
          'Completed',
          GETDATE()
        )
      `);
      console.log('Seeded initial ₹100 recharge record for Abc hospital.');
    }

    console.log('Prepaid & Postpaid tables successfully created and verified in MS SQL Server!');
  } catch (err) {
    console.error('Error creating billing tables:', err);
  } finally {
    if (pool) await pool.close();
  }
};

createBillingTables();
