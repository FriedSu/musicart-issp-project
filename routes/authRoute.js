const express = require("express");
const passport = require("../middleware/passport");
const router = express.Router();
const { forwardAuthenticated } = require("../middleware/check_auth");
const User = require("../models/userModel").User;

//Routes for authentication 
router.get("/login", forwardAuthenticated, (req, res) => {
    res.render("login", { message: req.flash('message') })
});
router.get("/register", (req, res) => {
    res.render("register", { message: req.flash('message') } )
});

router.post( 
    "/login",
    passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/auth/login",
    })
);

router.post("/register", (req, res) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if (user) {
                req.flash('message', `Account with email "${req.body.email}" already exists, please try a new email.`)
                res.redirect("/auth/register")
            } else {
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
            }
        })
});
module.exports = router;
