const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/check_auth");
const { who } = require("../middleware/check_auth");
const User = require("../models/userModel").User;
const url = require('url')
let auth = false;
router.get("/home", (req, res) => {
    let auth = true
    res.render("edit-profile", {
        user: req.user,
    });
});

User.find()
    .then(user => {
        // let usr = (JSON.parse(user));
        for (i in user) {
            console.log(`username = ${user[i].name}`)
            router.get(`/change-password/${user[i].name}`, (req, res) => {
                res.render("change-pswd");
            })
        }
    });
// router.get('/edit-profile/change-password:user.name', (req, res) => {
//     res.render("change-pswd", {
//         user: req.user,
//     });
// });



router.get("/change-name", (req, res) => {
    res.render("change-name", {
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

module.exports = router;