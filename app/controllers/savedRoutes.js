const connection = require("../connection/connection");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.saveRoute = (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      res.sendStatus(401);
      return;
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        res.status(403).send(err);
        return;
      }
      connection.query(`INSERT INTO SavedRoutes (owned_by, name, distance, description, markers, route) VALUES ('${user.username}', '${req.body.name}', '${req.body.distance}', '${req.body.description}', '${req.body.markers}', '${req.body.route}')`, (err) => {
        if (err) {
          res.sendStatus(400);
          return;
        }
        res.sendStatus(200);
      });
    })
  } catch {
    res.sendStatus(500);
  }
}

module.exports.getRoutes = (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      res.sendStatus(401);
      return;
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        res.sendStatus(403);
        return;
      }
      connection.query(`SELECT route FROM Routes WHERE username = '${user.username}'`, (err, result, field) => {
        if (err) {
          res.sendStatus(503);
          return;
        }
        res.sendStatus(200).json(result);
      });
    });
  } catch {
    res.sendStatus(500);
  }
}

module.exports.deleteRoute = (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      res.sendStatus(401);
      return;
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        res.sendStatus(403);
        return;
      }
      const sql = `DELETE FROM Routes WHERE owned_by = '${user.username}' AND name = '${req.name}'`
      connection.query(sql);
      res.sendStatus(200);
    })
  } catch {
    res.sendStatus(500);
  }
}
