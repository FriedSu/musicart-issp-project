const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/check_auth");

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

// this is where we will do the database handling ..
// router.post("/change-password", (req, res) => {

// };

// router.post("/change-name", (req, res) => {
    
// };

module.exports = router;