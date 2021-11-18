const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/check_auth");
const { who } = require("../middleware/check_auth");
const User = require("../models/userModel").User;

router.get("/", (req, res) => {
    res.render("help")
})

router.get("/report", (req, res) => {
    res.render("report", {
        user: req.user,
    });
});

router.post("/report", (req, res) => {
    const query  = User.where({ email: "admin@gmail.com" });
    query.findOne(function (err, usr) {
        if (err) {
            console.log(err);
        } else {
            let problem = `${req.user.email}: ${req.body.report}`
            usr.reportedProblems.push(problem)
            usr.save()
                .then((usr) => {
                    res.redirect("/auth/login");
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    });
})

module.exports = router;