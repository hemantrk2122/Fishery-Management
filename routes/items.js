const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Item = mongoose.model("Items");
const Boat = mongoose.model("Boats");
const {
	ensureAuthenticated
} = require("../helpers/auth");

// Code to show add item form
router.route("/add").get(ensureAuthenticated, (req, res) => {
	res.render("items/add");
});

router
	.route("/")
	// Code to show all the auctions
	.get((req, res) => {
		Item.find().then((items) => {
			res.render("items/index", {
				items: items,
			});
		});
	})

	// Code to create an auction and store it in database
	.post(ensureAuthenticated, (req, res) => {
		// x contains the extracted bid date from request in the Date object format
		let x = new Date(req.body.bid_date);
		let img = req.file;
		if (!img) {
			req.flash("error_msg", "Please select an Image file only.");
			res.redirect("/items/add");
		}

		let boat_number = req.body.boat_number;

		// If the boat_number given by user does not exist in the Boat database
		// then show an error else proceed to create the auction
		Boat.find({
				boat_number: boat_number,
			})
			.then((boat) => {
				// console.log(boat);
				if (boat.length == 0) {
					req.flash("error_msg", "That boat number is not registered.");
					return res.redirect("/items/add");
				}

				const imageUrl = img.path;
				const newItem = new Item({
					name: req.body.name,
					image: imageUrl,
					description: req.body.description,
					user: req.user.id,
					status: req.body.status,
					bid_time: x,
					boat_number: boat_number,
					amount_of_fish: req.body.amount_of_fish,
					grade: req.body.grade,
				});
				newItem
					.save()
					.then((newItem) => {
						console.log(newItem);
						req.flash(
							"success_msg",
							"Congrats, new Item Posted. Come back in a while to see all bids."
						);
						// redirect to item description page
						res.redirect(`items/show/${newItem._id}`);
					})
					.catch((err) => {
						req.flash(
							"error_msg",
							"Some error occurred. Please check all the fields."
						);
						res.redirect("/items/add");
					});
			})
			.catch((err) => console.log(err));
	});

// Code to show the description of an auction
router.route("/show/:id").get((req, res) => {
	Item.findById(req.params.id)
		.populate("user") // Populate replaces the id with all the other information of the user
		.populate("bids.user")
		.then((item) => {
			// console.log(item);
			res.render("items/show", {
				item: item,
			});
		});
});

// router.route("/edit/:id").get(ensureAuthenticated, (req, res) => {
//   Item.findOne({
//     _id: req.params.id
//   }).then(Item => {
//     if (req.user.id == Item.user) {
//       res.render("items/edit", {
//         item: Item
//       });
//     } else {
//       req.flash("error_msg", "Not Authorized");
//       res.redirect("/dashboard");
//     }
//   });
// });


// Code to show all my auctions
router.route("/my").get(ensureAuthenticated, (req, res) => {
	Item.find({
			user: req.user.id,
		})
		.sort({
			bid_time: "desc",
		})
		.then((items) => {
			res.render("items/my", {
				items: items,
			});
		});
});

// Code to aad bid on an auction
router.route("/addbid/:id").post(ensureAuthenticated, (req, res) => {
	Item.findById(req.params.id).then((item) => {

		// If bidding amount is not given show an error
		if (!req.body.amount) {
			req.flash("error_msg", "Please provide a valid amount.");
			return res.redirect(`/items/show/${req.params.id}`);
		}

		// If amount of fish needed is not given show an error
		if (!req.body.fish_amount) {
			req.flash("error_msg", "Please provide a valid amount of fish.");
			return res.redirect(`/items/show/${req.params.id}`);
		}

		// Create a bid object
		const newBid = {
			amount: req.body.amount,
			fish_amount: req.body.fish_amount,
			user: req.user.id,
		};

		item.bids.unshift(newBid); // append the new bid in the bids array of the item
		item.save();
		req.flash("success_msg", "Your Bid was successfully placed");
		res.redirect(`/items/show/${req.params.id}`);
	});
});

// Code to show all auctions created by a particular user
router.get("/user/:userId", (req, res) => {
	Item.find({
			user: req.params.userId,
		})
		.populate("user")
		.then((items) => {
			res.render("items/index", {
				items: items,
			});
		});
});

// Code to delete an auction
// A user can delete only the auctions he himself created
router.route("/:id").delete(ensureAuthenticated, (req, res) => { // id is the id of the item to be deleted
	Item.findById(req.params.id).then(item => {

		// If some other user is trying to delete current user's auction
		// show an error message
		if (req.user._id.toString() != item.user.toString()) {
			req.flash("error_msg", "You are not authorized to do that.");
			return res.redirect(`/dashboard`);
		}

		// else delete the auction
		Item.remove({
			_id: req.params.id,
		}).then(() => {
			req.flash("success_msg", "Item Successfully deleted.");
			res.redirect("/dashboard");
		});
	})
});

module.exports = router;