
function User(name,email){
	this.name=name
	this.email=email
	this.score=0
}

User.prototype={
	constructor: User,
	saveScore:(score)=>{
		this.score=score
	},
	getName:()=>{
		return this.name
	},
	getEmail:()=>{
		return this.email
	},
	getFullInfo:()=>{
		return `Name=${this.name} , Email=${this.email}, score:${this.score}`
	}
}
var yves=new User("Niyouh","@staff")

console.log(yves.getName())