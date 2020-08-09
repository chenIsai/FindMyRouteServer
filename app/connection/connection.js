const mysql = require("mysql");
require("dotenv").config();

var connection = mysql.createConnection({
  host: process.env.HOST_URL,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: "findmyroute",
  multipleStatements : true
})

connection.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Success");
});

module.exports = connection;
