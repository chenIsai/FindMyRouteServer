const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
require("dotenv").config();

const connection = require("./app/connection/connection");

const app = express();
app.use(express.json());

const port = 4000;

const users = [];

app.post("/users/login", async (req, res) => {
  const exists = users.find(user => user.name = req.body.username);
  if (!exists) {
    res.status(400).send("User does not exist!");
  }
  try {
    if (await bcrypt.compare(req.body.password, exists.password)) {
      console.log(exists.name);
      const accessToken = jwt.sign({username: exists.name}, process.env.ACCESS_TOKEN_SECRET);
      res.json({accessToken});
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    res.sendStatus(500);
  }

  const username = req.body.username;
  const user = {username};
})

app.post("/users/register", async (req, res) => {
  try {
    const exists = connection.query(`SELECT id FROM Users WHERE username="${req.body.username}"`, async (err, result, field) => {
      if (err) {
        res.sendStatus(503);
      }
      if (result.length) {
        res.sendStatus(409);
      } else {
        const hashPass = await bcrypt.hash(req.body.password, 10);
        var sql = `INSERT INTO Users (username, password, name, email) VALUES ("${req.body.username}", "${hashPass}", "${req.body.name}", "${req.body.email}")`
        connection.query(sql, (err, result) => {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            res.sendStatus(201);
          }
        })
      }
    })
  } catch {
    res.sendStatus(500);
  }
})


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
