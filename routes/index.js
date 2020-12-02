const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Item = mongoose.model("Items");
const {
  ensureAuthenticated
} = require("../helpers/auth");

router.route("/").get((req, res) => {
  res.render("index/welcome");
});

router.route("/about").get((req, res) => {
  res.render("index/about");
});

// Show all auctions(items) a user has created on the dashboard page
router.route("/dashboard").get(ensureAuthenticated, (req, res) => {
  Item.find({
    user: req.user.id
  }).then(items => {
    res.render("index/dashboard", {
      items: items
    });
  });
});

router.route("/about").get((req, res) => {
  res.send("index/about"); // render is same as send(render = send)
});
module.exports = router;