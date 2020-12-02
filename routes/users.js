const express = require("express");
const mongoose = require("mongoose");
const router = express();
const User = mongoose.model("Users");
const passport = require("passport");
const {
	ensureAuthenticated
} = require("../helpers/auth");
router
	.route("/register")
	.get((req, res) => {
		res.render("users/register");
	})
	.post((req, res) => {
		console.log(req.body);
		const newUser = new User({
			name: req.body.name,
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			aadhaar_number: req.body.aadhaar_number,
			address: req.body.address
		});
		newUser.save(err => {
			if (err) {
				req.flash("error_msg", "Sorry, that Username is taken");
				res.redirect("/users/register");
			}
			if (err === null) {
				req.flash("success_msg", "Congratulation, You can now Login");
				res.redirect("/users/login");
			}
		});
	});
router
	.route("/login")

	// Code to show login form
	.get((req, res) => {
		res.render("users/login");
	})

	// code to log the user in
	.post((req, res, next) => {
		passport.authenticate("local", {
			successRedirect: "/dashboard",
			failureRedirect: "/users/login",
			failureFlash: true
		})(req, res, next);
	});

// Code to log the user out
router.get("/logout", ensureAuthenticated, (req, res) => {
	req.logout();
	req.flash("success_msg", "You are logged out");
	res.redirect("/");
});

module.exports = router;