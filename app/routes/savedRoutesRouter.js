const express = require("express");
const controller = require("../controllers/savedRoutes");

const router = express.Router();

router.use(express.json());
router.use(controller.authenticateToken);
router.get("/", controller.getRoutes);
router.post("/", controller.saveRoute);
router.delete("/", controller.deleteRoute);

module.exports = router;