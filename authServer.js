const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const connection = require("./app/connection/connection");

const app = express();
app.use(express.json());

const port = 4000;

const users = [];

app.post("/users/login", async (req, res) => {
  try {
    // Get hashed password to compare
    connection.query(`SELECT password, id FROM Users WHERE username="${req.body.username}"`, async (err, result, field) => {
      if (err) {
        // Could not connect to Database
        res.sendStatus(503);
      }
      if (!result.length) {
        // Username undefined
        res.sendStatus(404);
      } else {
        // If valid password, return payload
        if (await bcrypt.compare(req.body.password, result[0].password)) {
          payload = {
            id: result[0].id,
          };
          console.log(payload);
          accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
          res.status(200).json({accessToken});
        } else {
          // Invalid password
          res.sendStatus(401);
        }
      }
    });
  } catch {
    // Could not connect
    res.sendStatus(500);
  }
})

app.post("/users/register", async (req, res) => {
  try {
    // Check if username has already been used
    connection.query(`SELECT id FROM Users WHERE username="${req.body.username}"`, async (err, result, field) => {
      if (err) {
        // Could not connect to Database
        res.sendStatus(503);
      }
      if (result.length) {
        // User already exists
        res.sendStatus(409);
      } else {
        // If non-existent, create new entry with req.body
        const hashPass = await bcrypt.hash(req.body.password, 10);
        var sql = `INSERT INTO Users (username, password, name, email) VALUES ("${req.body.username}", "${hashPass}", "${req.body.name}", "${req.body.email}")`
        connection.query(sql, (err, result) => {
          if (err) {
            // Error inserting user
            res.sendStatus(500);
          } else {
            // Successfully added
            res.sendStatus(201);
          }
        })
      }
    })
  } catch {
    // Could not connect
    res.sendStatus(500);
  }
})


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
