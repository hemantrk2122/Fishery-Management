const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		unique: true,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	aadhaar_number: {
		type: String,
		required: true,
	},
	isAdmin: {
		type: Boolean,
		default: false
	}
});
userSchema.methods.validPassword = function (password) {
	return this.password === password;
};
userSchema.plugin(uniqueValidator);
const userModel = mongoose.model("Users", userSchema);
module.exports = userModel;