require("dotenv").config();

const Pool = require("pg").Pool
const connection = new Pool({
  user: "api",
  host: process.env.HOST_URL,
  database: process.env.SQL_DATABASE,
  password: process.env.SQL_PASSWORD,
  port: 5432,
});

module.exports = connection;
