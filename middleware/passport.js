const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/userModel").User;
const bcrypt = require("bcryptjs");

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

const localLogin = new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
},
(email, password, done) => {
    // Find User
    User.findOne({ email: email })
    .then(user => {
        bcrypt.compare(password, user.password, function(error, isMatch) {
            if (error) {
                throw error
            } else if (!isMatch) {
                console.log("Password doesn't match!");
                return done(null, false, req.flash('message', "Incorrect password."))
            } else {
                console.log("Passwords match")
                return done(null, user, req.flash('message', 'User found.'));
            }
        })
        // if (user.password === password) {
        //     return done(null, user);
        // } else {
        //     return done(null, false, {message: "User not found, please try again!"})
        // }
    });
});

module.exports = passport.use(localLogin);
