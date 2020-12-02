const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Boat = mongoose.model("Boats");
const passport = require("passport");
const {
  ensureAuthenticated
} = require("../helpers/auth");

// To go to  boats/add page a user should be authenticated and he should be an admin
// If both are true render boats/add page
router.route("/add").get(ensureAuthenticated, (req, res) => {
  if (!req.user.isAdmin) {
    req.flash(
      "error_msg",
      "You are not authorized to do that."
    );
    return res.redirect("/");
  }
  res.render("boats/add");
});

router
  .route("/")

  // To add a boat to database the user should be authenticated
  // If he is, then receive data from request(page) and store it in database
  // If any error render boats/add page
  .post(ensureAuthenticated, (req, res) => {
    const newBoat = new Boat({
      owner_name: req.body.owner_name,
      boat_number: req.body.boat_number,
      capacity: req.body.capacity,
    });
    newBoat
      .save()
      .then(newBoat => {
        console.log(newBoat);
        req.flash(
          "success_msg",
          "Congrats, new Boat Added."
        );
        res.redirect("/dashboard");
      })
      .catch(err => {
        req.flash(
          "error_msg",
          "Some error occurred. Please check all the fields."
        );
        res.redirect("/boats/add");
      });
  });

module.exports = router;