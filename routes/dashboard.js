var express=require("express")
var router=express.Router()
var path=require("path")

router.get("/",(req,res,next)=>{
	console.log(req.session.user)
  res.render("dashboard",{
  	title:"Dashboard | YRouting",
  	data:req.session.user
  })
})

router.get("/profile",(req,res,next)=>{
	console.log(req.session.user)
  res.render("profile",{
  	title:"Profile | YRouting",
  	data:req.session.user
  })
})

module.exports=router