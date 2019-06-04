const express=require("express")
const route=express.Router();
const userModel=require("../models/usersModel")
const bcrypt = require("bcrypt");
const sendMail = require("./sendMails")
const jwt = require("jsonwebtoken");
const fs = require('fs');




requestRoute=async(userToken,requests)=>{
	const token=userToken;
	let output={
		amount:0,
		requestsBought:0,
		message:'',
	}
	await userModel.findOne({token:token},async(error,result)=>{
		if(error) console.log(error)
		else
			if(result !== null){
				var amountMoney=result.amount
				var requestAmountMoney= 0.334 * requests
				if( amountMoney - requestAmountMoney < 0 ){
					// request over money
					//let give him his/her lasts amount of request
					if(amountMoney !== 0){
						var requestsInAmountMoney = 30 * amountMoney;
						let payment= 0.334 * requestAmountMoney;
						output.requestsBought=requestsInAmountMoney;// number of requests our client deserves
						output.amount=requestAmountMoney
						output.message="ok"
						await userModel.updateOne({token:token},{ $set :{ amount:0 }})
						if(sendMail.send(result.email,"RoutingYvesApi","RoutingYvesApi Insufficient Bundle \n Please recharge your account")){
							console.log("Insufficient sent to the subscriber")
						}

					}else{
						if(sendMail.send(result.email,"RoutingYvesApi","RoutingYvesApi Insufficient Bundle \n Please recharge your account")){
							console.log("Insufficient sent to the subscriber")
						}
						output.requestsBought=0
						output.amount=0
						output.message="insufficient_bundle "
					}
				}else{
					output.requestsBought=requests
					output.amount=requestAmountMoney
					output.message="ok"
					await userModel.updateOne({token:token},{ $set :{ amount:(amountMoney-requestAmountMoney) }})

				}
				
			}else{
				output.requestsBought=0
				output.amount=0
				output.message="uknown_user"
			}
	})
	return output
}




route.get("/routes",async(req,res,next)=>{
	var requests=0;
	var token=req.query.token;
	var locations="-1.354556,29.443232;-1.354556,29.443232;-1.454556,29.443232;-1.254556,27.443232"
	var requests=locations.split(";").length;
	locations=locations.split(";");
	if(requests % 2 !== 0){
		locations.pop();
	}
	locations=locations.join(";")
	//remember requests
	await requestRoute(token,req.query.numbers).then(data=>{

		if(data.message === "insufficient_bundle " || data.message === "uknown_user"){
			res.json({
				status: "Error",
				message: "Sorry try again letter or contact the admininstrator",
				data: data.message
			});
		}else{

			res.json({
				status: "Success",
				message: "",
				data: data
			});
		}
		
	}).catch(error=>{
		res.json({
			status: "error",
			message: "Some error occured in this session please try agin letter",
			data: null
		});
	})
})

route.get("/addPayments",(req, res, next) =>{

		var number = req.query.number
		var amount = req.query.amount
		var transactionId = req.query.transactionId
		var moneyType = req.query.moneyType;

		if(moneyType === null || moneyType === undefined){
			res.send("error")
			return;
		}		


		var log=JSON.stringify({type:"Adding Payments",query:req.query,time:new Date().getTime() });
		fs.appendFileSync('./logs/paymentLogs.txt', log+",\n");

		userModel.findOne({ number: number,confirmed: true }, function(err, userInfo) {
			if (err) {
				next(err);
			} else {
				if(userInfo == null ){
					res.json({
						status: "error",
						message: "Invalid phone number or number is not confirmed!!!",
						data: null
					});
				}else{
					
					userModel.updateOne({email:userInfo.email},{$set :{
						amount : parseFloat(userInfo.amount)+parseFloat(amount),
						lastPayment : userInfo.amount,
						number : number,
						transactionId : transactionId,
						moneyType : moneyType,
						sentToken:false,
						datePayment:new Date().getTime()
					}},(err,result)=>{
						if (err) next(err);
						else
							var msg=`Dear ${userInfo.name}, we received your ${amount}${moneyType} payment.\n`+
									`Now you have ${parseFloat(amount)+parseFloat(userInfo.amount)}${moneyType} on your account \n`+
									`Here it is your  token ( ${userInfo.token} )  \n`+
									`Copy it to your codes and start/continue using the system \n`+
							        `If you incounter any problem please, reply to this email \n we will be happy to help`;
							if(sendMail.send(userInfo.email,"RoutingYvesApi Payment Success",msg)){
								userModel.updateOne({email:userInfo.email},{$set :{sentToken:true}})
								console.log("token sent to email")
							}else{
								console.log("token failed sent to email")
							}
							res.send("Payment success");
					})
				}
			}
		});
})

route.post("/signin",(req, res, next) =>{

		const email=req.body.email;
		const password=req.body.password;


		var log=JSON.stringify({type:"Login Users",query:req.query,time:new Date().getTime() });
		fs.appendFileSync('./logs/usersLoginLogs.txt', log+",\n");

		userModel.findOne({ email: email }, function(err, userInfo) {
			if (err) {
				next(err);
			} else {

				if (
					userInfo != null &&
					bcrypt.compareSync(password, userInfo.password)
				) {
					if(1){
						const token = jwt.sign(
							{ id: userInfo._id },
							req.app.get("secretKey"),
							{ expiresIn: "1h" }
						);

						req.session.token=token;
						let user={
							_id : userInfo._id,
							email : userInfo.email,
							name : userInfo.name,
							number : userInfo.number,
							token : userInfo.token,
							confirmed:userInfo.confirmed,
							amount : userInfo.amount,
							lastPayment : userInfo.lastPayment
						}
						req.session.user=user;

						res.json({
							status: "success",
							message: "user found!!!",
							data: { user: user, token: token }
						});
					}
				} else {
					res.json({
						status: "error",
						message: "Invalid email/password!!!",
						data: null
					});
				}
			}
		});
})
route.get("/comfirm",(req,res,next)=>{
	var confirmToken=req.query.token

	var log=JSON.stringify({type:"Confirming Users",query:req.query,time:new Date().getTime() });
	fs.appendFileSync('./logs/usersConfirmLogs.txt', log+",\n");

	userModel.findOne({confirmToken:confirmToken},(error,result)=>{
		if(error) next(error)
		else
			if(result !== null ){
				userModel.updateOne({confirmToken:confirmToken},{$set:{confirmed:true}},(err,result)=>{
					if(err) console.log(err)
					else
						res.render("confirm",{
							title:'Yrouting Confirmation Email',
							data:"Your email verification is done you may proceed with login.",
							login:req.login,
						})
				})
			}else{
				res.render("confirm",{
					title:'Yrouting Confirmation Email',
					data:"Your email verification link is not valid, you may request another one from panel.",
					login:req.login,
				})
			}
	})
})

route.post("/register",(req, res, next)=>{
		var name=req.body.name
		var email=req.body.email
		var password=req.body.password
		var number=req.body.number
		console.log(req.body)
		if(name.trim()=="" || email.trim()=="" || password.trim()=="" || number.trim()==""){
			res.redirect("/register.html")
			return;
		}

		

		var log=JSON.stringify({type:"Adding Users",query:req.query,time:new Date().getTime() });
		fs.appendFileSync('./logs/usersRegisterLogs.txt', log+",\n");

		userModel.findOne({ email: email }, function(err, userInfo) {
			if (err) {
				next(err);
			} else {
				if(userInfo != null){
					res.json({
						status: "error",
						message: "Can't register same email",
						data: null
					});
				}else{
					var dates=new Date().getTime();
					const confirmToken = bcrypt.hashSync(number+"--"+dates, 10);
					var dates=new Date().getTime();
					const token = bcrypt.hashSync(number+"--"+dates+567564, 10);
					number=number.replace("+","");
					number=number.replace(" ","");
					userModel.create(
						{
							token:token,
							name: name,
							email: email,
							password: password,
							number:number,
							amount : 0,
							confirmed:0,
							confirmToken:confirmToken,
							dateReg : new Date().getTime() 
						},
						function(err, result) {
							if (err) next(err);
							else
								var userInfo=result;
								const token = jwt.sign(
									{ id: userInfo._id },
									req.app.get("secretKey"),
									{ expiresIn: "1h" }
								);
								req.session.token=token;
								let user={
									_id : userInfo._id,
									email : userInfo.email,
									name : userInfo.name,
									number : userInfo.number,
									token : userInfo.token,
									confirmed:userInfo.confirmed,
									amount : 0
								}
								req.session.user=user;
								//var linkServer="http://localhost:1000/";
								var linkServer="https://api-testing-yves.herokuapp.com/";
								var msg=`Here it is yout confirmation link "${linkServer}userAuth/comfirm?token=${confirmToken}" \n`+
							        `  Use this token in your code do not show it to any of your colegeus \n if you didn't ask for this please delete it.`;
								if(sendMail.send(email,"RoutingYvesApi Confirmation Email",msg)){
									res.json({
										status: "success",
										message: "User added successfully!!!",
										data: email
									});
									//res.redirect("login.html")
								}else{
									res.json({
										status: "success",
										message: "User added successfully but no confirmation code!!!",
										data: email
									});
									//res.redirect("login.html")
								}
								
						}
					);
				
				}
				
			}
		});
})

module.exports =route