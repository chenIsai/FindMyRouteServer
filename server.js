const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
require("dotenv").config();

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
  res.json(users.filter(user => user.username === req.user.username))
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
    console.log(user);
    req.user = user;
    next();
  })
}


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
