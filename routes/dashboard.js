var express=require("express"),
    router=express.Router(),
    path=require("path"),
    fs=require("fs")

router.get("/",(req,res,next)=>{
	// console.log(req.session.user)
  res.render("dashboard",{
  	title:"Dashboard | YRouting",
  	data:req.session.user
  })
})

router.get("/profile",(req,res,next)=>{
  res.render("profile",{
  	title:"Profile | YRouting",
  	data:req.session.user
  })
})
router.get("/requests",(req,res,next)=>{
  res.render("requests",{
    title:"Requests | YRouting",
    data:req.session.user
  })
})
router.get("/money",(req,res,next)=>{
  res.render("money",{
    title:"Money | YRouting",
    data:req.session.user
  })
})
router.get("/token",(req,res,next)=>{
  res.render("token",{
    title:"Token | YRouting",
    data:req.session.user
  })
})
router.get("/moneyPayments",(req,res,next)=>{
    try {  
        var dir=__dirname.replace("routes","logs");
        var data = fs.readFile(path.join(dir,"paymentLogs.txt"), 'utf8',function(error,data){
            if (error) console.log(error)
            else
              var json=JSON.parse('{"data":['+data.toString().substring(0,data.length-2) + ']}'); 
              var number= req.query.number;
              json=json.data;
              var newData=json.filter(data=>{
                return data.query.number.trim() == number.trim()
              })
              res.send(newData)
        });
        
    } catch(e) {
        res.send("Server error,please wait and try again later")
        // console.log('Error:', e.stack);
    }
})
router.get("/requests:id",(req,res,next)=>{
  res.render("requests",{
    title:"Requests | YRouting",
    data:req.session.user
  })
})

module.exports=router