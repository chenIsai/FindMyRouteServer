const connection = require("../connection/connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();


module.exports.authenticateToken = (req, res, next) => {
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

module.exports.getUser = (req, res) => {
  try {
    connection.query(`SELECT * FROM Users WHERE id="${req.user.id}"`, (err, result, field) => {
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
}

module.exports.login = async (req, res) => {
  try {
    // Get hashed password to compare
    connection.query(`SELECT password, id FROM Users WHERE username="${req.body.username}"`, async (err, result, field) => {
      if (err) {
        res.sendStatus(503); // Could not connect to Database
      }
      if (!result.length) {
        res.sendStatus(404); // Username undefined
      } else {
        // If valid password, return payload
        if (await bcrypt.compare(req.body.password, result[0].password)) {
          payload = {
            id: result[0].id,
          };
          accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
          res.status(200).json({accessToken});
        } else {
          res.sendStatus(401); // Invalid password
        }
      }
    });
  } catch {
    res.sendStatus(500); // Could not connect
  }
}

module.exports.register = async (req, res) => {
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
}
