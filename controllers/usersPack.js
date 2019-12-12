const usersDays = require("./usersDays")

const developer = {
	time : usersDays.oneWeekTime,
	amount : 0,
	money : "none",
}

const business = {
	time : usersDays.forever,
	amount : 85000,
	money : "none",
}

const pay_as_you_go = {
	time : usersDays.forever,
	amount : 0,
	money : "required",
}


module.exports = {
	pay_as_you_go,
	business,
	developer
}