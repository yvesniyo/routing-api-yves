const express = require("express");
const route = express.Router();
const userModel = require("../models/usersModel");
const bcrypt = require("bcrypt");
const sendMail = require("./sendMails");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const makeId = require("./makeId");

route.get("/addPayments", (req, res, next) => {
  //http://127.0.0.1:1000/userAuth/addPayments?number=250728710379&amount=200&transactionId=654223n34j&moneyType=rwf
  var number = req.query.number;
  var amount = req.query.amount;
  var transactionId = req.query.transactionId;
  var moneyType = req.query.moneyType;

  if (moneyType === null || moneyType === undefined) {
    res.send("error");
    return;
  }

  var log = JSON.stringify({
    type: "Adding Payments",
    query: req.query,
    time: new Date().getTime()
  });
  fs.appendFileSync("./logs/paymentLogs.txt", log + ",\n");

  userModel.findOne({ number: number, confirmed: true }, function(
    err,
    userInfo
  ) {
    if (err) {
      next(err);
    } else {
      if (userInfo == null) {
        res.json({
          status: "error",
          message: "Invalid phone number or number is not confirmed!!!",
          data: null
        });
      } else {
        userModel.updateOne(
          { email: userInfo.email },
          {
            $set: {
              amount: parseFloat(userInfo.amount) + parseFloat(amount),
              lastPayment: userInfo.amount,
              number: number,
              transactionId: transactionId,
              moneyType: moneyType,
              sentToken: false,
              datePayment: new Date().getTime()
            }
          },
          (err, result) => {
            if (err) next(err);
            else
              var msg =
                `Dear ${
                  userInfo.name
                }, we received your ${amount}${moneyType} payment.\n` +
                `Now you have ${parseFloat(amount) +
                  parseFloat(userInfo.amount)}${moneyType} on your account \n` +
                `Here it is your  token ( ${userInfo.token} )  \n` +
                `Copy it to your codes and start/continue using the system \n` +
                `If you incounter any problem please, reply to this email \n we will be happy to help`;
            if (
              sendMail.send(
                userInfo.email,
                "RoutingYvesApi Payment Success",
                msg
              )
            ) {
              userModel.updateOne(
                { email: userInfo.email },
                { $set: { sentToken: true } }
              );
              console.log("token sent to email");
            } else {
              console.log("token failed sent to email");
            }
            res.send("Payment success");
          }
        );
      }
    }
  });
});

module.exports = route;
