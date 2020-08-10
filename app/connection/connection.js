require("dotenv").config();

const Pool = require("pg").Pool
const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = connection;
