const sendMail = require("./sendMails")
const express=require("express")
const route=express.Router();

route.get("",(req,res,next)=>{
	var email = req.query.email;
	var header = req.query.header;
	var msg = req.query.msg;
	if(sendMail.send(email,header,msg)){
		console.log("Email Sent")
		res.send("sent");
	}else{
		res.send("error");
		console.log("Email not sent")
	}
})
// route.get("/payapi",(req,res,next)=>{
	
// })
module.exports =  route
