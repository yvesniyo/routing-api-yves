const express=require("express")
const app=express();
const path=require("path")

app.use("/",express.static(__dirname))

app.get("/",(req,res,next)=>{
	res.sendFile(path.join(__dirname,"test.html"));
})


app.listen(80,()=>{
	console.log("Server started on port 80")
})

