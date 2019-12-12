var express = require("express")
var router=express.Router()
var path = require("path")
var jwt = require("jsonwebtoken");
var userModel=require("../models/usersModel")


router.get("/",(req,res,next)=>{
    res.render("home",{
    	title:'YRouting',
    	data:null,
        login:req.login,
    }) 
})
router.get("/login",validateUser,(req,res,next)=>{
  if(req.login){
    res.redirect("dashboard")
  }else{
    res.render("login",{
    	title:'YRouting Login',
    	data:null,
        login:req.login,
    }) 
  }

 
})
router.get("/register",(req,res,next)=>{
  if(req.login){
    res.redirect("dashboard")
  }else{
    res.render("register",{
        title:'YRouting Login',
        data:null,
        login:req.login,
    }) 
  }
})
router.get("/documentation",(req,res,next)=>{

    res.render("documentation",{
        title:'YRouting Documentation',
        data:null,
        login:req.login,
    }) 
  
})

router.get("/refresh",validateUser,(req,res,next)=>{
    if(!req.login){
      res.json({
        status: "error",
        message: "logout",
        data: null
      });
      return;
    }
    const email=req.session.user.email;
    // var log=JSON.stringify({type:"Refreshing Login Users",query:req.query,time:new Date().getTime() });
    // fs.appendFileSync('./logs/refreshingUsersLoginLogs.txt', log+",\n");
    userModel.findOne({ email: email }, function(err, userInfo) {
      if (err) {
        next(err);
      } else {
        if (userInfo != null) {
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
              lastPayment : userInfo.lastPayment,
              timeExpire : userInfo.timeExpire,
              numberOfMonths : userInfo.numberOfMonths,
            }
            req.session.user=user;
            res.json({
              status: "success",
              message: "user session found found!!!",
              data: null
            });
          }
        } else {
          res.json({
            status: "error",
            message: "logout",
            data: null
          });
        }
      }
    });  
})
function validateUser(req, res, next) {
	jwt.verify(req.session.token, req.app.get("secretKey"), function(
	  err,
	  decoded
	) {
	  if (err) {
	    req.login=false;
	    next()
	  } else {
	    req.login=true
	    next();
	  }
	});
}
module.exports=router