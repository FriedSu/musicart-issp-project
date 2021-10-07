const express = require('express');
const User = require("../models/userModel").User;
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/check_auth");

router.get("/home", ensureAuthenticated, (req, res) => {
    res.render("home", {
        user: req.user,
    });
});
router.get("/admin", ensureAuthenticated,(req, res) => {
    User.find()
    .then(user => {
        res.render("admin", {
            user: user,
        });

    })
});

module.exports = router;