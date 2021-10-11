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
router.post("/admin", (req, res) => {
    profile = req.body[0]
    console.log(`user info: ${profile}`)
    res.redirect("/admin/userprofile")

    router.get("/admin/userProfile", ensureAuthenticated,(req, res) => {
       
        res.render("admin_user_profile", {
            user: profile
        })
    });
})


module.exports = router;