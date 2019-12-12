require("events").EventEmitter.defaultMaxListeners = 25;
const request = require("request");
const express = require("express");
const app = express();
const usersController = require("./controllers/users");
const mailer = require("./controllers/mailer");
const bodyParser = require("body-parser");
const mongoose = require("./config/database"); //database configuration
var jwt = require("jsonwebtoken");
const cors = require("cors");
var ejs = require("ejs");
var path = require("path");
const globals = require("./config/globals");
var session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
var store = new MongoDBStore({
  uri: globals.dbUriSessions,
  collection: "mySessions"
});
var routingsUser = require("./routes/user");
var routingsDashboard = require("./routes/dashboard");
var routingMapRequests = require("./controllers/routingMapRequests");
var userPayments = require("./controllers/payments");

app.set("view engine", "ejs");
app.set("secretKey", "moneything");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "This is a secret",
    cookie: {
      maxAge: 1000 * 60 * 60 * 2 * 1 // 2 hour
    },
    store: store,
    resave: true,
    saveUninitialized: true
  })
);
app.use("/userAuth", usersController);
app.use("/userPayments", userPayments);
app.use("/mailserver", mailer);
app.use("/dashboard", validateUser, checkLogin, routingsDashboard);
app.use("/", validateUser, routingsUser);
app.use("/route/v1/", routingMapRequests);
app.get("/logout", (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.use("/", express.static("views"));
app.use("/userAuth", express.static("views"));
app.use("/dashboard", express.static("views"));
app.use("/route/v1/", express.static("views"));
app.use("/userPayments", express.static("views"));

function checkLogin(req, res, next) {
  if (req.login) {
    next();
  } else {
    res.redirect("/");
  }
}
function validateUser(req, res, next) {
  jwt.verify(req.session.token, req.app.get("secretKey"), function(
    err,
    decoded
  ) {
    if (err) {
      req.login = false;
      next();
    } else {
      req.login = true;
      req.userId = decoded.id;
      next();
    }
  });
}

store.on("error", function(error) {
  console.log(error);
});
mongoose.connection.on("error", () => {
  console.log("MongoDB connection error");
});
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection success");
});
app.use(function(req, res, next) {
  res.render("404", {
    title: "YRouting Page Not Found",
    data: null,
    login: req.login
  });
});

app.use(validateUser, function(err, req, res, next) {
  console.log(err);
  if (err.status === 404)
    res.render("404", {
      titles: "YRouting Page Not Found",
      data: null,
      login: req.login
    });
  else
    res.render("500", {
      title: "YRouting Server error ",
      data: null,
      login: req.login
    }); //res.status(500).json({ message: "Something looks wrong :( !!!" });
});
var port = process.env.PORT || 1000;
app.listen(port, () => {
  console.log("Server started on port " + port);
});
