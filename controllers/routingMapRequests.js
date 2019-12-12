const express = require("express");
const route = express.Router();
const userModel = require("../models/usersModel");
const bcrypt = require("bcrypt");
const sendMail = require("./sendMails");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const OSRM_SEVER_LOCATION_PREFIX = "http:";
const OSRM_SEVER_LOCATION = "127.0.0.1:5000";
const request = require("request");
const usersPack = require("./usersPack");

let allUsers = {};

var usersAuthToken = require("./usersAuthToken");
function reloadUsers() {
  usersAuthToken.reloadUsers().then(users => {
    allUsers = users;
  });
}
setInterval(() => {
  reloadUsers();
}, 1000 * 60 * 2);

reloadUsers();
const requestRoute = async (userToken, requests) => {
  const token = userToken;
  let output = {
    amount: 0,
    requestsBought: 0,
    message: ""
  };
  return new Promise(async (resolve, reject) => {
    if (allUsers[token] !== undefined) {
      if(allUsers[token].timeExpire == usersPack.business.time){
        output.requestsBought = requests;
        output.amount = null;
        output.message = "ok";
        resolve(output)
        return;
      }else{
        var amountMoney = allUsers[token].amount;
        var requestAmountMoney = 0.334 * requests;
        if (amountMoney - requestAmountMoney < 0) {
          // request over money
          //let give him his/her lasts amount of request
          if (amountMoney !== 0) {
            var requestsInAmountMoney = 30 * amountMoney;
            let payment = 0.334 * requestAmountMoney;
            output.requestsBought = requestsInAmountMoney; // number of requests our client deserves
            output.amount = requestAmountMoney;
            output.message = "ok";
            await userModel.updateOne({ token: token }, { $set: { amount: 0 } });
            allUsers[token].amount = 0;
            await userModel.findOne({ token: token }, (error, result) => {
              if (error) console.log(error);
              userModel.findOne({email:result.email},(er,rslt)=>{
                  if(er) console.log(er);
                  else{
                    if(rslt !== null){
                      if( rslt.sentOverBundle == undefined || !rslt.sentOverBundle){
                        if (sendMail.send(result.email,"RoutingYvesApi","RoutingYvesApi Insufficient Bundle \n Please recharge your account")) {
                          console.log("Insufficient sent to the subscriber");
                          userModel.updateOne({email:result.email},{ $set : {sentOverBundle : true}})
                        }
                      }
                    }
                  }
              })
              
            });
          }else {
            await userModel.findOne({ token: token }, (error, result) => {
              if (error) console.log(error);
              else if (
                sendMail.send(
                  result.email,
                  "RoutingYvesApi",
                  "RoutingYvesApi Insufficient Bundle \n Please recharge your account"
                )
              ) {
                console.log("Insufficient sent to the subscriber");
              }
            });
            output.requestsBought = 0;
            output.amount = 0;
            output.message = "insufficient_bundle";
          }
        } else {
          output.requestsBought = requests;
          output.amount = requestAmountMoney;
          output.message = "ok";
          await userModel.updateOne(
            { token: token },
            { $set: { amount: amountMoney - requestAmountMoney } }
          );
          allUsers[token].amount = amountMoney - requestAmountMoney;
        }
      }
      resolve(output);
    } else {
      output.requestsBought = 0;
      output.amount = 0;
      output.message = "uknown_user";
      reject(output);
    }
  });
};

route.get("/:token/driving/:coardinates", async (req, res, next) => {
  var requests = 0;
  var token = req.params.token;

  var locations = req.params.coardinates;

  var requests = locations.split(";").length;
  locations = locations.split(";");
  if (requests % 2 !== 0) {
    locations.pop();
  }
  var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

  locations = locations.join(";");
  //remember requests
  requests = locations.length;
  await requestRoute(token, requests)
    .then(data => {
      if (
        data.message === "insufficient_bundle" ||
        data.message === "uknown_user"
      ) {
        if (data.message === "insufficient_bundle") {
          res.json({
            status: "Error",
            message: "insufficient bundle in the account",
            data: data.message
          });
        }
        if (data.message === "uknown_user") {
          res.json({
            status: "Error",
            message: "uknown user, please use the token we gave you",
            data: data.message
          });
        }
      } else {
        fullUrl = fullUrl.replace("token=" + token + "&", "");
        var log = JSON.stringify({
          type: "User requesting transaction",
          query: req.query,
          time: new Date().getTime()
        });
        fs.appendFileSync("./logs/requestLogs.txt", log + ",\n");

        fullUrl = fullUrl.split("/");
        fullUrl[0] = OSRM_SEVER_LOCATION_PREFIX;
        fullUrl[2] = OSRM_SEVER_LOCATION;
        fullUrl.splice(5, 1);
        fullUrl = fullUrl.join("/");
        if (fullUrl[fullUrl.length - 1] == "=") {
          fullUrl += ";";
        }
        // console.log(fullUrl)
        request.get(fullUrl, (error, response, body) => {
          if (error) {
            res.json({
              errorCode: 501,
              status: "Error",
              message:
                "Sorry Our servers under mantaince,try again later.if this continues contact system administrator.",
              data: null
            });
          } else if (!error && response.statusCode == 200) {
            var locals = JSON.parse(body);
            locals.appIdToken = token;
            res.send(locals);
          }
        });

        // res.json({
        // 	status: "Success",
        // 	message: "",
        // 	data: data
        // });
      }
    })
    .catch(error => {
      // console.log(error)
      if (error.message === "insufficient_bundle") {
        res.status(401).json({
          status: "Error",
          message: "insufficient bundle in the account",
          data: error.message
        });
      } else if (error.message === "uknown_user") {
        res.status(401).json({
          status: "Error",
          message: "uknown user, please use the token we gave you",
          data: error.message
        });
      } else {
        res.status(401).json({
          status: "error",
          message: "Some error occured in this session please try agin letter",
          data: null
        });
      }
    });
});

module.exports = route;
