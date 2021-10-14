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
    // let profile = JSON.parse(req.body.user)
    let profile = req.body.user
    console.log(profile);
    // for (i in profile) {
    //     let usr = profile[i]
    //     console.log(usr)
    //     console.log(typeof(usr));
    // }
    
    User.findOne( { _id: profile})
        .then(usr => {

            res.redirect("/admin/userprofile")
            router.get("/admin/userProfile", ensureAuthenticated,(req, res) => {
               
                res.render("admin_user_profile", {
                    user: usr
                })
            });
        })

})


module.exports = router;