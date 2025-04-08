require("dotenv").config();
const connectionString =
  process.env.DB_CONNECTION_STRING ||
  "DATABASE=mydb;HOSTNAME=localhost;PORT=25004;PROTOCOL=TCPIP;UID=KARAN;PWD=karan4342;";
module.exports = { connectionString };
