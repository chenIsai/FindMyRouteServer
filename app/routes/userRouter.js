const express = require("express");
const controller = require("../controllers/users");

const router = express.Router();

router.use(express.json());
router.use("/edit/", controller.authenticateToken);
router.get("/login", controller.authenticateToken, controller.getUser);
router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/token", controller.refreshToken);
router.delete("/logout", controller.logout);
router.post("/edit/username", controller.changeUsername);
router.post("/edit/password", controller.changePassword);
router.delete("/delete", controller.authenticateToken, controller.deleteUser);

module.exports = router;
