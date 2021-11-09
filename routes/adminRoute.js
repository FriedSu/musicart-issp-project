// const express = require('express');
// const User = require("../models/userModel").User;
// const router = express.Router();
// const { ensureAuthenticated } = require("../middleware/check_auth");
// router.get("/home", (req, res) => {
//     let auth = true
//     res.render("edit-profile", {
//         user: req.user,
//     });
// });
// User.find()
//     .then(user => {
//         // let usr = (JSON.parse(user));
//         for (i in user) {
//             console.log(`username = ${user[i].name}`)
//             router.get(`/change-profile/${user[i].name}`, (req, res) => {
//                 res.render("change-pswd");
//             })
//         }
//     });