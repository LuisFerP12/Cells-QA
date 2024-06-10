const express = require("express");
const router = express.Router();
const teamsControllers = require("../controllers/teamsControllers");

router.get("/:userId/teams", teamsControllers.getUserTeams);
router.post("/createTeam", teamsControllers.createTeam);
router.delete('/user-teams/:userId/:teamId', teamsControllers.deleteTeamMember);
router.post("/addTeam", teamsControllers.addTeam);
module.exports = router;