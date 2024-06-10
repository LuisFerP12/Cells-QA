const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers");


router.get("/", userControllers.getAllUsers);
router.post("/register", userControllers.createUser);
router.post("/login");

module.exports = router;
