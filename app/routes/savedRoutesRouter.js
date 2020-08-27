const express = require("express");
const controller = require("../controllers/savedRoutes");

const router = express.Router();

router.use(express.json());
router.use(controller.authenticateToken);
router.get("/", controller.getRoutes);
router.post("/save/planned", controller.plannedRoute);
router.post("/save/ran", controller.ranRoute);
router.delete("/", controller.deleteRoute);
router.delete("/clear", controller.deleteALL);
router.post("/edit", controller.edit);

module.exports = router;
