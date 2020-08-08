const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
require("dotenv").config();

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
      res.send("Denied");
    }
  } catch (e) {
    res.status(500).send(e)
  }

  const username = req.body.username;
  const user = {username};
})

app.post("/users/register", async (req, res) => {
  try {
    const hashPass = await bcrypt.hash(req.body.password, 10)
    const exists = users.find(user => user.username = req.body.username);
    const user = exists ?  null : {name: req.body.username, password: hashPass};
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
