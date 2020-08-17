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
    if (!token) {
      res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      connection.query(`INSERT INTO Routes (owned_by, name, distance, description, markers, route) VALUES ('${user.username}', '${req.name}', '${req.distance}', '${req.description}', '${req.markers}', '${req.route}'`);
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
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      connection.query(`SELECT route FROM Routes WHERE username = '${user.username}'`, (err, result, field) => {
        if (err) {
          res.sendStatus(503);
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
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      const sql = `DELETE FROM Routes WHERE owned_by = '${user.username}' AND name = '${req.name}'`
      connection.query(sql);
      res.sendStatus(200);
    })
  } catch {
    res.sendStatus(500);
  }
}
