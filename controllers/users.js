const express = require("express");
const route = express.Router();
const userModel = require("../models/usersModel");
const bcrypt = require("bcrypt");
const sendMail = require("./sendMails");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const makeId = require("./makeId");
const usersPack = require("./usersPack");
const globals = require("../config/globals");
const usersDays = require("../controllers/usersDays");

route.post("/signin", (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  var log = JSON.stringify({
    type: "Login Users",
    query: req.query,
    time: new Date().getTime()
  });
  fs.appendFileSync("./logs/usersLoginLogs.txt", log + ",\n");

  userModel.findOne({ email: email }, function(err, userInfo) {
    if (err) {
      next(err);
    } else {
      if (userInfo != null && bcrypt.compareSync(password, userInfo.password)) {
        if (1) {
          const token = jwt.sign(
            { id: userInfo._id },
            req.app.get("secretKey"),
            { expiresIn: "1h" }
          );

          req.session.token = token;
          let user = {
            _id: userInfo._id,
            email: userInfo.email,
            name: userInfo.name,
            number: userInfo.number,
            token: userInfo.token,
            confirmed: userInfo.confirmed,
            amount: userInfo.amount,
            lastPayment: userInfo.lastPayment,
            timeExpire : userInfo.timeExpire,
            numberOfMonths : userInfo.numberOfMonths,

          };
          req.session.user = user;

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
});
route.get("/comfirm", (req, res, next) => {
  var confirmToken = req.query.token;
  var log = JSON.stringify({
    type: "Confirming Users",
    query: req.query,
    time: new Date().getTime()
  });
  fs.appendFileSync("./logs/usersConfirmLogs.txt", log + ",\n");
  userModel.findOne({ confirmToken: confirmToken }, (error, result) => {
    if (error) next(error);
    else if (result !== null) {
      userModel.updateOne(
        { confirmToken: confirmToken },
        { $set: { confirmed: true } },
        (err, result) => {
          if (err) console.log(err);
          else
            res.render("confirm", {
              title: "Yrouting Confirmation Email",
              data:
                "Your email verification is done you may proceed with login.",
              login: req.login
            });
        }
      );
    } else {
      res.render("confirm", {
        title: "Yrouting Confirmation Email",
        data:
          "Your email verification link is not valid, you may request another one from panel.",
        login: req.login
      });
    }
  }); 
});
route.get("/resendEmail",(req,res,next)=>{
  var linkServer = globals.host;
  var confirmToken = "";
  var email = req.query.email.trim();
  userModel.findOne({email:email},(err,result)=>{
    if(err) console.log("error")
    else{
      if(result !== null){
        confirmToken = result.confirmToken;
        var msg =
          `Here it is yout confirmation link "${linkServer}userAuth/comfirm?token=${confirmToken}" \n` +
          `  Use this token in your code do not show it to any of your colegeus \n if you didn't ask 
          for this please delete it.`;
        if (sendMail.send(email, "RoutingYvesApi Confirmation Email", msg) ) {
          res.json({
            status: "success",
            message: "User confirmation sent successfully!!!",
            data: email
          });
          //res.redirect("login.html")
        } else {
          res.json({
            status: "success",
            message: "User confirmation sent successfully but no confirmation code!!!",
            data: email
          });
          //res.redirect("login.html")
        }
      }else{
        res.json({
            status: "error",
            message: "Uknown user",
            data: email
          });
      }
    }
  })
  
})

route.post("/register", (req, res, next) => {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var number = req.body.number;
  if (
    name.trim() == "" ||
    email.trim() == "" ||
    password.trim() == "" ||
    number.trim() == ""
  ) {
    res.redirect("/register.html");
    return;
  }

  var log = JSON.stringify({
    type: "Adding Users",
    query: req.query,
    time: new Date().getTime()
  });
  fs.appendFileSync("./logs/usersRegisterLogs.txt", log + ",\n");
  userModel.findOne({ email: email }, async function(err, userInfo) {
    if (err) {
      next(err);
    } else {
      if (userInfo != null) {
        res.json({
          status: "error",
          message: "Can't register same email",
          data: null
        });
      } else {
        var numberOfMonths = new Date().getTime() + usersDays.oneMonthTime;
        var dates = new Date().getTime();
        const confirmToken = bcrypt.hashSync(number + "--" + dates, 10);
        var token;
        async function releaseToken() {
          token = makeId(10);
          await userModel.findOne({ token: token }, (err, res) => {
            if (err) return;
            else {
              if (res != null) {
                releaseToken();
              }
            }
          });
        }
        await releaseToken();
        let expireDate = usersPack.developer.time;
        if(req.body.userPack !== undefined){
          if(usersPack[req.body.userPack] !== undefined){
            expireDate = usersPack[req.body.userPack].time;
            if(req.body.userPack !== "business"){
              expireDate = new Date().getTime() + expireDate;
            }else{
              expireDate = usersPack.business.time;
            }
          }

        }
        number = number.replace("+", "");
        number = number.replace(" ", "");
        userModel.create(
          {
            token: token,
            name: name,
            email: email,
            password: password,
            number: number,
            amount: 0,
            confirmed: 0,
            confirmToken: confirmToken,
            dateReg: new Date().getTime(),
            timeExpire :  expireDate,
            numberOfMonths : numberOfMonths,
          },
          function(err, result) {
            if (err) next(err);
            else var userInfo = result;
            const token = jwt.sign(
              { id: userInfo._id },
              req.app.get("secretKey"),
              { expiresIn: "1h" }
            );
            req.session.token = token;
            let user = {
              _id: userInfo._id,
              email: userInfo.email,
              name: userInfo.name,
              number: userInfo.number,
              token: userInfo.token,
              confirmed: userInfo.confirmed,
              amount: 0,
              timeExpire :  expireDate,
              numberOfMonths : numberOfMonths,
            };
            req.session.user = user;
            var linkServer = globals.host;
            var msg =
              `Here it is yout confirmation link "${linkServer}userAuth/comfirm?token=${confirmToken}" \n` +
              `  Use this token in your code do not show it to any of your colegeus \n if you didn't ask for this please delete it.`;
            if (sendMail.send(email, "RoutingYvesApi Confirmation Email", msg) ) {
              res.json({
                status: "success",
                message: "User added successfully!!!",
                data: email
              });
            } else {
              res.json({
                status: "success",
                message: "User added successfully but no confirmation code!!!",
                data: email
              });
            }
          }
        );
      }
    }
  });
});

module.exports =route;
