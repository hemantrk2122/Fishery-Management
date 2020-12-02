const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const User = mongoose.model("Users");
module.exports = function (passport) {
  passport.use(
    new LocalStrategy({
      usernameField: "username"
    }, (username, password, done) => {
      User.findOne({
        username: username
      }).then(user => {
        if (!user) {
          return done(null, false, {
            message: "User does not exist"
          });
        }
        if (!user.validPassword(password)) {
          return done(null, false, {
            message: "Incorrect password"
          });
        }
        return done(null, user);
      });
    })
  );
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};