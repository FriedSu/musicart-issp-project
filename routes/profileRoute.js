const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/check_auth");
const User = require("../models/userModel").User;

router.get("/home", (req, res) => {
    res.render("edit-profile", {
        user: req.user,
    });
});

router.get("/change-password", (req, res) => {
    res.render("change-pswd", {
        user: req.user,
    });
});

router.get("/change-name", (req, res) => {
    res.render("change-name", {
        user: req.user,
    });
});

router.get("/change-picture", (req, res) => {
    res.render("change-picture", {
        user: req.user,
    });
});


router.post("/change-password", (req, res) => {
    const query  = User.where({ email: req.user.email });
    query.findOne(function (err, user) {
        if (err) {
            console.log(err);
        } else {
            user.password = req.body.confirmPassword
            user.save()
                .then((user) => {
                    res.redirect("/auth/login");
                })
                .catch((err) => {
                    console.log(err);
                });
        };
    });
});


router.post("/change-name", (req, res) => {
    const query  = User.where({ email: req.user.email });
    query.findOne(function (err, user) {
        if (err) {
            console.log(err);
        } else {
            user.name = req.body.name
            user.save()
                .then((user) => {
                    res.redirect("/auth/login");
                })
                .catch((err) => {
                    console.log(err);
                });
        };
    });
});

router.post("/change-picture", (req, res) => {
    const query  = User.where({ email: req.user.email });
    query.findOne(function (err, user) {
        if (err) {
            console.log(err);
        } else {
            user.profilePicture = req.body.picture
            user.save()
                .then((user) => {
                    res.redirect("/auth/login");
                })
                .catch((err) => {
                    console.log(err);
                });
        };
    });
});

module.exports = router;