const express = require('express');
const User = require("../models/userModel").User;
// const Purchase = require("../models/purchaseModel").Purchase
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/check_auth");
const mongoose = require('mongoose');
const Purchase = mongoose.model('Purchase')
// const Purchase = require("../models/purchaseModel").Purchase;

router.get("/", (req, res) => {
    res.render("landing")
})

router.get("/home", ensureAuthenticated, (req, res) => {
    let userName = req.user.name
    let purchaseHistory = null
    // Purchase.find({name: userName}, (err, result) => {
    //     if(err){
    //         console.log(err)
    //     }else{
    //         purchaseHistory.push(result)
    //     }
    // })
    // console.log(purchaseHistory)
    Purchase.find({name: userName})
    .then(result => {
        purchaseHistory = result
        res.render("home", {
            user: req.user,
            data: purchaseHistory
        });
    })
});
router.get("/admin", ensureAuthenticated,(req, res) => {
    User.find()
    .then(result => {
        res.render("admin", {
            user: result,
        });
        
    });
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
router.get("/profile", ensureAuthenticated, (req, res) => {
    res.render("usrProfile", {
        user: user
    })
})


router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/auth/login");
});

router.get("/settings", ensureAuthenticated, (req, res) => {
    res.render("settings", {
        user: req.user
    });
});

module.exports = router;