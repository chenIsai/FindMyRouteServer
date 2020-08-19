const express = require("express");
const controller = require("../controllers/savedRoutes");

const router = express.Router();

router.use(express.json());
router.get("/", controller.authenticateToken, controller.getRoutes);
router.post("/", controller.saveRoute);
router.delete("/", controller.deleteRoute);
router.delete("/clear", controller.deleteALL);
router.post("/edit", controller.edit);

module.exports = router;
