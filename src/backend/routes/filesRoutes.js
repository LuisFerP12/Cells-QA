const express = require("express");
const router = express.Router();
const filesControllers = require("../controllers/filesControllers");


router.get("/dson/:teamId/:directoryFather", filesControllers.getSonDirectories);


module.exports = router;