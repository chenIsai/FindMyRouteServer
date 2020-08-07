const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const port = 3000;

const users = [];

app.get("/users", (req, res) => {
  res.json(users);
})

app.post("/login", (req, res) => {
})

app.post("/register", (req, res) => {
  console.log(res.body);
  const user = {name: req.body.name, password: req.body.pass};
  users.push(user)
  res.status(201).send();
})


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
