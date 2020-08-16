const express = require("express");
const controller = require("../controllers/users");

const router = express.Router();

router.use(express.json());
router.get("/login", controller.authenticateToken, controller.getUser);
router.post("/loginr", controller.login);
router.post("/register", controller.register);
router.post("/token", controller.refreshToken);
router.delete("/logout", controller.logout);

module.exports = router;
