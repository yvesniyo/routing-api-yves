const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

//Define a schema
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},
	email:{
		type: String,
		trim: true,
		required: true
	},
	password:{
		type: String,
		trim: true,
		required: true
	},
	token:{
		type: String,
		trim: true,
		required: false
	},
	amount:{
		type: Number,
		trim: true,
		required: false
	},
	transactionId:{
		type: String,
		trim: false,
		required: false
	},
	number:{
		type: String,
		trim: false,
		required: false
	},
	confirmToken:{
		type: String,
		trim: false,
		required: false
	},
	confirmed:{
		type: Boolean,
		trim: false,
		required: false
	},
	dateReg:{
		type: String,
		trim: false,
		required: false
	},
	datePayment:{
		type: String,
		trim: false,
		required: false
	},
	lastPayment:{
		type: Number,
		trim: false,
		required: false
	},
	moneyType:{
		type: String,
		trim: false,
		required: false
	}

});

UserSchema.pre("save", function(next) {
	if(this.password !== undefined){
		this.password = bcrypt.hashSync(this.password, saltRounds);
	}
	next();
});

module.exports = mongoose.model("User", UserSchema);
