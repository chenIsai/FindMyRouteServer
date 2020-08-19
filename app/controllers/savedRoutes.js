const connection = require("../connection/connection");
const jwt = require("jsonwebtoken");
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

module.exports.saveRoute = (req, res) => {
  try {
    const token = req.body.token;
    var exists = false;
    if (!token) {
      res.sendStatus(401);
      return;
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        res.status(403).send(err);
        return;
      }
      connection.query(`SELECT name FROM SavedRoutes WHERE owned_by = '${user.username}' AND name = '${req.body.name}'`, (err, result, field) => {
        if (err) {
          console.log("err occured at first query");
          res.status(400).send(err);
          return;
        }
        if (result.rows.length) {
          console.log("name exists");
          res.sendStatus(409); // Route name already exists
          exists = true;
          return;
        }
      });
      if (!exists) {
        connection.query(`INSERT INTO SavedRoutes (owned_by, name, distance, description, markers, route) VALUES ('${user.username}', '${req.body.name}', '${req.body.distance}', '${req.body.description}', '${req.body.markers}', '${req.body.route}')`, (err) => {
          if (err) {
            console.og("err at second query");
            res.sendStatus(400);
            return;
          }
          console.log("sending ok");
          res.sendStatus(200);
        });
      }
    })
  } catch {
    res.sendStatus(500);
  }
}

module.exports.getRoutes = (req, res) => {
  try {
    connection.query(`SELECT * FROM SavedRoutes WHERE owned_by = '${req.user.username}'`, (err, result, field) => {
      if (err) {
        res.sendStatus(503);
        return;
      }
      res.status(200).json(result.rows);
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
      const sql = `DELETE FROM SavedRoutes WHERE owned_by = '${user.username}' AND name = '${req.body.name}'`
      connection.query(sql);
      res.sendStatus(200);
    })
  } catch {
    res.sendStatus(500);
  }
}

module.exports.deleteALL = (req, res) => {
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
      const sql = `DELETE FROM SavedRoutes WHERE owned_by = '${user.username}'`;
      connection.query(sql);
      res.sendStatus(200);
    })
  } catch {
    res.sendStatus(500);
  }
}

module.exports.edit = (req, res) => {
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
      const sql = `UPDATE SavedRoutes SET description = '${req.body.description}', name = '${req.body.name}' WHERE owned_by = '${user.username}' AND name = '${req.body.oldName}'`;
      connection.query(sql, (err, result, field) => {
        if (err) {
          res.sendStatus(503);
          return;
        }
        res.sendStatus(200);
      });
    });
  } catch {
    res.sendStatus(500);
  }
}
