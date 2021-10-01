const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/check_auth");

router.get("/home", ensureAuthenticated, (req, res) => {
    res.render("home", {
        user: req.user,
    });
});

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/auth/login");
});


module.exports = router;