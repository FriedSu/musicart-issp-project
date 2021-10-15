const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/check_auth");

router.get("/checkout", (req, res) => res.render("checkout"));

module.exports = router;