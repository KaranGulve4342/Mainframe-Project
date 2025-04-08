const express = require("express")
const ibmdb = require("ibm_db")
const bodyParser = require("body-parser")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const { connectionString } = require("./config");

const app = express()
const port = process.env.PORT || 8000

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
)
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({ storage })

// Test DB connection
function testConnection() {
  return new Promise((resolve, reject) => {
    ibmdb.open(connectionString, (err, conn) => {
      if (err) {
        console.error("Error connecting to DB2:", err)
        reject(err)
        return
      }
      console.log("Connected to DB2 successfully")
      conn.close(() => {
        resolve("Connection test successful")
      })
    })
  })
}

// Initialize database and create tables if they don't exist
async function initializeDatabase() {
  try {
    const conn = await ibmdb.open(connectionString)

    // Create USERS table if it doesn't exist
    const userTableCheckSql = `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = CURRENT SCHEMA AND TABNAME = 'USERS'`
    const userTableResult = await conn.query(userTableCheckSql)

    if (userTableResult.length === 0) {
      console.log("Creating USERS table...")
      const createUserTableSql = `
        CREATE TABLE USERS (
          USERID VARCHAR(36) NOT NULL,
          NAME VARCHAR(100) NOT NULL,
          EMAIL VARCHAR(100) NOT NULL UNIQUE,
          PHONE VARCHAR(20) NOT NULL,
          CREATED_AT TIMESTAMP DEFAULT CURRENT TIMESTAMP,
          PRIMARY KEY (USERID)
        )
      `
      await conn.query(createUserTableSql)
      console.log("USERS table created successfully")
    }

    // Create PATIENTS table if it doesn't exist
    const patientTableCheckSql = `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = CURRENT SCHEMA AND TABNAME = 'PATIENTS'`
    const patientTableResult = await conn.query(patientTableCheckSql)

    if (patientTableResult.length === 0) {
      console.log("Creating PATIENTS table...")
      const createPatientTableSql = `
        CREATE TABLE PATIENTS (
          PATIENTID VARCHAR(36) NOT NULL,
          USERID VARCHAR(36) NOT NULL,
          NAME VARCHAR(100) NOT NULL,
          EMAIL VARCHAR(100) NOT NULL,
          PHONE VARCHAR(20) NOT NULL,
          BIRTHDATE DATE,
          GENDER VARCHAR(10),
          ADDRESS VARCHAR(255),
          OCCUPATION VARCHAR(100),
          EMERGENCY_CONTACT_NAME VARCHAR(100),
          EMERGENCY_CONTACT_NUMBER VARCHAR(20),
          PRIMARY_PHYSICIAN VARCHAR(100),
          INSURANCE_PROVIDER VARCHAR(100),
          INSURANCE_POLICY_NUMBER VARCHAR(50),
          ALLERGIES VARCHAR(500),
          CURRENT_MEDICATION VARCHAR(500),
          FAMILY_MEDICAL_HISTORY VARCHAR(500),
          PAST_MEDICAL_HISTORY VARCHAR(500),
          IDENTIFICATION_TYPE VARCHAR(50),
          IDENTIFICATION_NUMBER VARCHAR(50),
          IDENTIFICATION_DOCUMENT_PATH VARCHAR(255),
          PRIVACY_CONSENT SMALLINT DEFAULT 0,
          CREATED_AT TIMESTAMP DEFAULT CURRENT TIMESTAMP,
          PRIMARY KEY (PATIENTID),
          FOREIGN KEY (USERID) REFERENCES USERS(USERID) ON DELETE CASCADE
        )
      `
      await conn.query(createPatientTableSql)
      console.log("PATIENTS table created successfully")
    }

    // Create APPOINTMENTS table if it doesn't exist
    const appointmentTableCheckSql = `SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = CURRENT SCHEMA AND TABNAME = 'APPOINTMENTS'`
    const appointmentTableResult = await conn.query(appointmentTableCheckSql)

    if (appointmentTableResult.length === 0) {
      console.log("Creating APPOINTMENTS table...")
      const createAppointmentTableSql = `
        CREATE TABLE APPOINTMENTS (
          APPOINTMENTID VARCHAR(36) NOT NULL,
          PATIENTID VARCHAR(36) NOT NULL,
          USERID VARCHAR(36) NOT NULL,
          PRIMARY_PHYSICIAN VARCHAR(100) NOT NULL,
          SCHEDULE TIMESTAMP NOT NULL,
          REASON VARCHAR(500),
          NOTE VARCHAR(500),
          STATUS VARCHAR(20) NOT NULL,
          CANCELLATION_REASON VARCHAR(500),
          CREATED_AT TIMESTAMP DEFAULT CURRENT TIMESTAMP,
          PRIMARY KEY (APPOINTMENTID),
          FOREIGN KEY (PATIENTID) REFERENCES PATIENTS(PATIENTID) ON DELETE CASCADE,
          FOREIGN KEY (USERID) REFERENCES USERS(USERID) ON DELETE CASCADE
        )
      `
      await conn.query(createAppointmentTableSql)
      console.log("APPOINTMENTS table created successfully")
    }

    conn.close()
    console.log("Database initialization complete")
  } catch (err) {
    console.error("Error initializing database:", err)
    throw err
  }
}
// Initialize the database when the server starts
;(async () => {
  try {
    await testConnection()
    await initializeDatabase()
  } catch (err) {
    console.error("Failed to initialize:", err)
  }
})()

// Import routes
const userRoutes = require("./routes/users")
const patientRoutes = require("./routes/patients")
const appointmentRoutes = require("./routes/appointments")

// Use routes
app.use("/api/users", userRoutes)
app.use("/api/patients", patientRoutes)
app.use("/api/appointments", appointmentRoutes)

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Healthcare API Server!")
})

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

module.exports = { connectionString, upload }