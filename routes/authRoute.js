const express = require("express");
const router = express.Router();

//Routes for authentication 
router.get("/login",(req, res) => res.render("login"));

module.exports = router;