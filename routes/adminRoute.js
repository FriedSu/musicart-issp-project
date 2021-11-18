const express = require('express');
const User = require("../models/userModel").User;
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/check_auth");

User.find()
    .then(user => {
        for (i in user) {
            console.log(`username = ${user[i].name}`)
            router.get(`/view/${user[i].name}`, ensureAuthenticated, (req, res) => {
                res.render("admin-profile", {
                    user : user[i]
                });
            }
        )}
    });

router.get("/reported-issues", (req, res) => {
        res.render("reported-issues", {
             reports: req.user.reportedProblems
            });
    });

module.exports = router;