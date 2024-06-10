const express = require("express");
const router = express.Router();
const projectControllers = require("../controllers/projectControllers");

router.get("/dfather/:teamId", projectControllers.getFatherDirectories);
router.delete("/deleteDirectory/:directoryId", projectControllers.deleteDirectory);
router.post("/addDirectory", projectControllers.addDirectory);
module.exports = router;