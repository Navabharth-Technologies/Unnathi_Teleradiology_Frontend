require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

const setupDatabase = async () => {
  let pool;
  try {
    console.log('Connecting to SQL Server...');
    pool = await sql.connect(dbConfig);
    
    const dbName = process.env.DB_DATABASE || 'Unnathi_Teleradiology';

    // 1. Create Database if it doesn't exist
    console.log(`Checking if database '${dbName}' exists...`);
    const checkDbQuery = `
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}')
      BEGIN
        CREATE DATABASE [${dbName}];
      END
    `;
    await pool.request().query(checkDbQuery);
    console.log(`Database '${dbName}' ensured.`);

    // Switch to the new database
    await pool.request().query(`USE [${dbName}]`);

    // 2. Create Tables
    const tables = [
      {
        name: 'Sites',
        query: `
          IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Sites' and xtype='U')
          CREATE TABLE Sites (
            Id NVARCHAR(100) PRIMARY KEY,
            Name NVARCHAR(255),
            Type NVARCHAR(100),
            Email NVARCHAR(255),
            Phone NVARCHAR(100),
            Address NVARCHAR(MAX),
            Status NVARCHAR(50) DEFAULT 'Active',
            CreatedAt DATETIME DEFAULT GETDATE(),
            UpdatedAt DATETIME DEFAULT GETDATE()
          )
        `
      },
      {
        name: 'Hospitals',
        query: `
          IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Hospitals' and xtype='U')
          CREATE TABLE Hospitals (
            Id NVARCHAR(100) PRIMARY KEY,
            SiteId NVARCHAR(100),
            Name NVARCHAR(255),
            Email NVARCHAR(255),
            Phone NVARCHAR(100),
            OrganizationType NVARCHAR(100),
            Status NVARCHAR(50) DEFAULT 'Active',
            CreatedAt DATETIME DEFAULT GETDATE(),
            UpdatedAt DATETIME DEFAULT GETDATE()
          )
        `
      },
      {
        name: 'Users',
        query: `
          IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' and xtype='U')
          CREATE TABLE Users (
            Id NVARCHAR(100) PRIMARY KEY,
            Name NVARCHAR(255),
            Email NVARCHAR(255),
            Phone NVARCHAR(100),
            Role NVARCHAR(100),
            SiteId NVARCHAR(100),
            HospitalId NVARCHAR(100),
            Status NVARCHAR(50) DEFAULT 'Active',
            CreatedAt DATETIME DEFAULT GETDATE(),
            UpdatedAt DATETIME DEFAULT GETDATE()
          )
        `
      },
      {
        name: 'Radiologists',
        query: `
          IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Radiologists' and xtype='U')
          CREATE TABLE Radiologists (
            Id NVARCHAR(100) PRIMARY KEY,
            UserId NVARCHAR(100),
            Name NVARCHAR(255),
            Email NVARCHAR(255),
            Phone NVARCHAR(100),
            RegistrationId NVARCHAR(100),
            Qualification NVARCHAR(255),
            Specialization NVARCHAR(255),
            SignatureUrl NVARCHAR(MAX),
            StampText NVARCHAR(MAX),
            Availability NVARCHAR(100) DEFAULT 'Online',
            Status NVARCHAR(50) DEFAULT 'Active',
            Subspecialties NVARCHAR(MAX), -- JSON array string
            Modalities NVARCHAR(MAX), -- JSON array string
            AssignedHospitals NVARCHAR(MAX), -- JSON array string
            CreatedAt DATETIME DEFAULT GETDATE(),
            UpdatedAt DATETIME DEFAULT GETDATE()
          )
        `
      },
      {
        name: 'Patients',
        query: `
          IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Patients' and xtype='U')
          CREATE TABLE Patients (
            Id NVARCHAR(100) PRIMARY KEY,
            Name NVARCHAR(255),
            Age INT,
            Gender NVARCHAR(50),
            Phone NVARCHAR(100),
            Email NVARCHAR(255),
            Address NVARCHAR(MAX),
            CreatedAt DATETIME DEFAULT GETDATE(),
            UpdatedAt DATETIME DEFAULT GETDATE()
          )
        `
      },
      {
        name: 'Studies',
        query: `
          IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Studies' and xtype='U')
          CREATE TABLE Studies (
            Id NVARCHAR(100) PRIMARY KEY,
            PatientId NVARCHAR(100),
            HospitalId NVARCHAR(100),
            RadiologistId NVARCHAR(100),
            Modality NVARCHAR(100),
            StudyName NVARCHAR(255),
            StudyDate DATETIME,
            Status NVARCHAR(100),
            ReportText NVARCHAR(MAX),
            CreatedAt DATETIME DEFAULT GETDATE(),
            UpdatedAt DATETIME DEFAULT GETDATE()
          )
        `
      },
      {
        name: 'Invoices',
        query: `
          IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Invoices' and xtype='U')
          CREATE TABLE Invoices (
            Id NVARCHAR(100) PRIMARY KEY,
            HospitalId NVARCHAR(100),
            Amount DECIMAL(18, 2),
            Date DATETIME,
            Status NVARCHAR(100),
            CreatedAt DATETIME DEFAULT GETDATE(),
            UpdatedAt DATETIME DEFAULT GETDATE()
          )
        `
      },
      {
        name: 'Templates',
        query: `
          IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Templates' and xtype='U')
          CREATE TABLE Templates (
            Id NVARCHAR(100) PRIMARY KEY,
            Name NVARCHAR(255),
            Modality NVARCHAR(100),
            Content NVARCHAR(MAX),
            CreatedAt DATETIME DEFAULT GETDATE(),
            UpdatedAt DATETIME DEFAULT GETDATE()
          )
        `
      },
      {
        name: 'Modalities',
        query: `
          IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Modalities' and xtype='U')
          CREATE TABLE Modalities (
            Id NVARCHAR(100) PRIMARY KEY,
            Code INT,
            Name NVARCHAR(100),
            Description NVARCHAR(255),
            CreatedAt DATETIME DEFAULT GETDATE(),
            UpdatedAt DATETIME DEFAULT GETDATE()
          )
        `
      },
      {
        name: 'CustomRoles',
        query: `
          IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CustomRoles' and xtype='U')
          CREATE TABLE CustomRoles (
            Id NVARCHAR(100) PRIMARY KEY,
            Name NVARCHAR(100),
            Permissions NVARCHAR(MAX), -- JSON string
            CreatedAt DATETIME DEFAULT GETDATE(),
            UpdatedAt DATETIME DEFAULT GETDATE()
          )
        `
      }
    ];

    for (const table of tables) {
      console.log(`Creating/Ensuring table '${table.name}'...`);
      await pool.request().query(table.query);
      console.log(`Table '${table.name}' created/ensured successfully.`);
    }

    console.log('Database setup complete!');

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    if (pool) {
      await pool.close();
      console.log('Database connection closed.');
    }
  }
};

setupDatabase();
