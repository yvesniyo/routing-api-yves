require('events').EventEmitter.defaultMaxListeners = 25
const request=require("request")
const express=require("express")
const app=express();
const usersController=require("./controllers/users")
const mailer=require("./controllers/mailer")
const bodyParser = require("body-parser");
const mongoose = require("./config/database"); //database configuration
var jwt = require("jsonwebtoken");
const cors=require("cors")
var ejs=require("ejs")
var path=require("path")
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
  uri:'mongodb+srv://yvesapi:myECVrPTq3naSRAI@cluster0-gj93l.azure.mongodb.net/connect_mongodb_session_test?retryWrites=true&w=majority',
  //uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
  collection: 'mySessions'
});
var routingsUser=require("./routes/user")
var routingsDashboard=require("./routes/dashboard")
// var routingsSuper=require("./routes/super")

// var data = fs.readFileSync('./images/video.json', 'utf8');
//     console.log(JSON.parse('{"data":['+data.toString().substring(0,data.length-1) + ']}'));  

app.set("view engine","ejs")
app.set("secretKey", "moneything");
app.set('views', path.join(__dirname, 'views'));



app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 2 * 1 // 2 hour
  },
  store: store,
  resave: true,
  saveUninitialized: true
}));
app.use("/userAuth",usersController)
app.use("/mailserver",mailer)

app.use("/dashboard",validateUser,checkLogin,routingsDashboard)
app.use("/",validateUser,routingsUser)
app.get("/logout",(req,res,next)=>{
  req.session.destroy(()=>{
    res.redirect("/")
  })
})

app.use("/",express.static('views'))
app.use("/userAuth",express.static('views'))
app.use("/dashboard",express.static('views'))

app.get("/map/:token",(req,res,next)=>{
	//console.log(req.params.id)
	request.get(`https://jsonplaceholder.typicode.com/todos`,(error,response,body)=>{
		if(!error && response.statusCode == 200){
			var locals=JSON.parse(body)
			res.send(locals)
		}
	})
})
function checkLogin(req,res,next){
  if(req.login){
    next()
  }else{
    res.redirect("/")
  }
}
function validateUser(req, res, next) {
  jwt.verify(req.session.token, req.app.get("secretKey"), function(
    err,
    decoded
  ) {
    if (err) {
      //res.redirect("/")
      //res.json({ status: "error", message: err.message, data: null });
      req.login=false;
      next()
    } else {
      req.login=true
      req.userId = decoded.id;
      next();
    }
  });
}



store.on('error', function(error) {
  console.log(error);
});
mongoose.connection.on("error",()=>{
      console.log("MongoDB connection error")
  }
);
mongoose.connection.on("connected",()=>{
      console.log("MongoDB connection success")
  }
);
app.use(function(req, res, next) {
  res.render("404",{
    title:"YRouting Page Not Found",
    data:null,
    login:req.login,
  })
  //console.log("Page not Found")
});

app.use(validateUser,function(err, req, res, next) {
  console.log(err);
  //console.log("error")
  if (err.status === 404)
    res.render("404",{
      titles:"YRouting Page Not Found",
      data:null,
      login:req.login,
    })
  else res.render("500",{title:"YRouting Server error ",data:null,login:req.login,}) //res.status(500).json({ message: "Something looks wrong :( !!!" });
});
var port=process.env.PORT || 1000;
app.listen(port,()=>{
	console.log("Server started on port "+port)
})

