const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Item = mongoose.model("Items");
const Boat = mongoose.model("Boats");
const {
  ensureAuthenticated
} = require("../helpers/auth");

// Code to show the search reports form
router.route("/").get(ensureAuthenticated, (req, res) => {
    // If the user is not an admin, redirect to main page
    if (!req.user.isAdmin) {
      req.flash(
        "error_msg",
        "You are not authorized to do that."
      );
      return res.redirect("/");
    }
    res.render("reports/search");
  })

  // Code to find the auctions/boats as defined in search field
  // and then show it on the results page
  .post(ensureAuthenticated, (req, res) => {
    // If the user is not an admin, redirect to main page
    if (!req.user.isAdmin) {
      req.flash(
        "error_msg",
        "You are not authorized to do that."
      );
      return res.redirect("/");
    }

    // Extract data from request to search in database
    let report = req.body.report;
    let start_date = new Date(req.body.start_date).toISOString();
    let end_date = new Date(req.body.end_date).toISOString()

    // Code to search boats/auctions registered between two given dates
    if (report == "boats") {
      Boat.find({
        date_created: {
          $gte: start_date,
          $lte: end_date
        }
      }).then(boats => {
        console.log(boats);
        res.render("reports/results", {
          boats: boats
        });
      });
    } else if (report == "items") {
      Item.find({
        date_created: {
          $gte: start_date,
          $lte: end_date
        }
      }).then(items => {
        console.log(items);
        res.render("reports/results", {
          items: items
        });
      });
    }
  });

module.exports = router;