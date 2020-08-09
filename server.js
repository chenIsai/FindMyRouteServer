const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
require("dotenv").config();

const connection = require("./app/connection/connection");

const app = express();
app.use(express.json());

const port = 3000;

const users = [
  {
    username: "Yeet",
    data: "Yate",
  },
  {
    username: "Yate",
    data: "Yeet",
  },
];

app.get("/users", authenticateToken, (req, res) => {
  try {
    connection.query(`SELECT * FROM Users WHERE id="${req.user.id}"`, (err, result, field) => {
      console.log(err);
      if (err) {
        res.sendStatus(503);
      }
      if (!result.length) {
        // Could not find user
        res.sendStatus(404);
      } else {
        payload = {
          name: result[0].name,
          email: result[0].email,
          username: result[0].username,
        };
        res.status(200).json(payload);
      }
    })
  } catch (e) {
    res.status(500).send(e);
  }
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401)
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403)
    }
    req.user = user;
    next();
  })
}


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
