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

router.post("/reported-issues/:index", (req, res) => {
    let index = parseInt(req.params.index)
    const query  = User.where({ email: req.user.email });
    query.findOne(function (err, usr) {
        if (err) {
            console.log(err);
        } else {
            usr.reportedProblems.splice(index, 1)
            usr.save()
                .then((usr) => {
                    res.redirect("/admin/reported-issues");
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    });
})

module.exports = router;