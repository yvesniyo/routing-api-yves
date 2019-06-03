var express=require("express")

var app=express();

app.get("/",(req,res,next)=>{
  console.log("user")
  res.send("hello user")
})
var port=process.env.PORT || 1000
app.listen(port,()=>{
  console.log("the server is running on this port "+ port)
})