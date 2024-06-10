const express = require("express");
const router = express.Router();
const teamsControllers = require("../controllers/teamsControllers");

router.get("/:userId/teams", teamsControllers.getUserTeams);

module.exports = router;