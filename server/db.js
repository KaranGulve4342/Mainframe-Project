const ibmdb = require("ibm_db")
const { v4: uuidv4 } = require("uuid")
const { connectionString } = require("./config")

// Helper function to execute a query
async function executeQuery(query, params = []) {
  let conn
  try {
    conn = await ibmdb.open(connectionString)
    const result = await conn.query(query, params)
    return result
  } catch (error) {
    console.error("Database error:", error)
    throw error
  } finally {
    if (conn) {
      try {
        await conn.close()
      } catch (err) {
        console.error("Error closing connection:", err)
      }
    }
  }
}

// Generate a unique ID (similar to Appwrite's ID.unique())
function generateUniqueId() {
  return uuidv4()
}

// Format date for DB2
function formatDate(date) {
  if (!date) return null

  const d = new Date(date)
  if (isNaN(d.getTime())) return null

  return d
}

module.exports = {
  executeQuery,
  generateUniqueId,
  formatDate,
}
