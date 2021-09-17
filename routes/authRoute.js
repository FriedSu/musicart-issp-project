const express = require("express");
const passport = require("../middleware/passport");
const router = express.Router();
const { forwardAuthenticated } = require("../middleware/check_auth");
const User = require("../models/userModel").User;

//Routes for authentication 
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"))

router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/auth/login",
    })
);

router.post("/register", (req, res) => {
    const user = new User({
        name: req.body.name, 
        email: req.body.email,
        password: req.body.password,
    });
    user.save()
        .then((result) => {
            res.redirect("/auth/login")
        })
        .catch((err) => {
            console.log(err);
        })
});
module.exports = router;
