const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

const app = express();
app.use(express.json());

const port = 3000;

const users = [];

app.get("/users", (req, res) => {
  res.json(users);
})

app.post("/users/login", async (req, res) => {
  console
  const user = users.find(user => user.name = req.body.name);
  if (!user) {
    res.status(400).send("User does not exist!");
  }
  try {
    if (await bcrypt.compare(req.body.pass, user.password)) {
      res.send("Success");
    } else {
      res.send("Denied");
    }
  } catch {
    res.status(500).send("Error");
  }
})

app.post("/users/register", async (req, res) => {
  try {
    const hashPass = await bcrypt.hash(req.body.pass, 10)
    const exists = users.find(user => user.name = req.body.name);
    const user = exists ?  null : {name: req.body.name, password: hashPass};
    if (user) {
      users.push(user)
      res.status(201).send("Success");
    } else {
      res.status(409).send("User already exists")
    }
  } catch {
    res.status(500).send("Error");
  }
})


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
