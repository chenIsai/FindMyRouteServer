const connection = require("../connection/connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1800s"});
}

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
}

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

module.exports.refreshToken = (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.sendStatus(401);
  }
  connection.query(`SELECT * FROM RefreshTokens WHERE value = '${token}'`, (err, result) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    if (!result.rows.length) {
    res.sendStatus(403);
    return;
    } else {
      jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
          res.sendStatus(403);
          return;
        }
        connection.query(`DELETE FROM RefreshTokens WHERE value = '${token}'`);
        const payload = {username: user.username}
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        connection.query(`INSERT INTO RefreshTokens (value) VALUES ('${refreshToken}')`);
        res.status(200).json({accessToken, refreshToken});
      })
    }
  })
}


module.exports.getUser = (req, res) => {
  try {
    connection.query(`SELECT * FROM Users WHERE username = '${req.user.username}'`, (err, result, field) => {
      if (err) {
        res.sendStatus(503);
        return;
      }
      if (!result.rows || !result.rows.length) {
        // Could not find user
        res.sendStatus(404);
      } else {
        payload = {
          name: result.rows[0].name,
          username: result.rows[0].username,
          routes: result.rows[0].total_routes,
          distance: result.rows[0].total_distance,
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
    connection.query(`SELECT password FROM Users WHERE username = '${req.body.username}'`, async (err, result, field) => {
      if (err) {
        res.sendStatus(503); // Could not connect to Database
        return;
      }
      if (!result.rows.length) {
        res.sendStatus(404); // Username undefined
        return;
      } else {
        // If valid password, return payload
        if (await bcrypt.compare(req.body.password, result.rows[0].password)) {
          payload = {
            username: req.body.username,
          };
          const accessToken = generateAccessToken(payload);
          const refreshToken = generateRefreshToken(payload);
          connection.query(`INSERT INTO RefreshTokens (value) VALUES ('${refreshToken}')`, (err, result) => {
            if (err) {
              res.sendStatus(503);
              return;
            }
          });
          res.status(200).json({accessToken, refreshToken});
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
    connection.query(`SELECT id FROM Users WHERE username = '${req.body.username}'`, async (err, result, field) => {
      if (err) {
        res.sendStatus(503); // Could not connect to Database
        return;
      }
      if (result.rows.length) {
        res.sendStatus(409); // User already exists
        return;
      } else {
        // If non-existent, create new entry with req.body
        const hashPass = await bcrypt.hash(req.body.password, 10);
        var sql = `INSERT INTO Users (username, password, name) VALUES ('${req.body.username}', '${hashPass}', '${req.body.name}')`
        connection.query(sql, (err, result) => {
          if (err) {
            res.sendStatus(500); // Error inserting user
          } else {
            const payload = {username: req.body.username};
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);
            res.status(201).json({accessToken, refreshToken}); // Successfully added
          }
        })
      }
    })
  } catch {
    // Could not connect
    res.sendStatus(500);
  }
}

module.exports.logout = (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      res.sendStatus(200);
      return;
    }
    connection.query(`DELETE FROM RefreshTokens WHERE value = '${token}'`, (err, result) => {
      if (err) {
        res.sendStatus(401);
        return;
      }
      res.sendStatus(200);
    })
  } catch {
    res.sendStatus(500);
  }
}

module.exports.changeUsername = async (req, res) => {
  try {
    // Check if username has already been used
    connection.query(`SELECT id FROM Users WHERE username = '${req.user.username}'`, async (err, result, field) => {
      if (err) {
        res.sendStatus(503); // Could not connect to Database
        return;
      }
      if (!result.rows.length) {
        res.sendStatus(404); // User does not exists
        return;
      } else {
        const sql = `UPDATE Users SET username = '${req.body.newUser}' WHERE username = '${req.user.username}'`;
        connection.query(sql, (err, result, field) => {
          if (err) {
            res.sendStatus(503);
            return;
          }
          res.sendStatus(200);
        });
      }
    });
  } catch {
    res.sendStatus(500);
  }
}

module.exports.changePassword = async (req, res) => {
  try {
    // Check if user exists
    connection.query(`SELECT id FROM Users WHERE username = '${req.user.username}'`, async (err, result, field) => {
      if (err) {
        res.sendStatus(503); // Could not connect to Database
        return;
      }
      const hashPass = await bcrypt.hash(req.body.newPass, 10);
      const sql = `UPDATE Users SET password = ${hashPass} WHERE username = ${req.user.username}`;
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
