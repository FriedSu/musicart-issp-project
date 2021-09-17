
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/userModel").User;

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
        if (user) {
            return done(null, user);
        } else {
            return done(null, false, {message: "User not found, please try again!"})
        }
    });
});

module.exports = passport.use(localLogin);
