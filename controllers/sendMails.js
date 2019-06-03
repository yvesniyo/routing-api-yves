const nodemailer = require('nodemailer');
var cred= require("../config/appEmailPassword");
var credentials=cred.credentials;


var smtpTransport = nodemailer.createTransport({
  service: credentials.service,
  auth: {
    user: credentials.email,
    pass: credentials.password
  }
});
module.exports={
  send:async (to,subject,message)=>{
      var data = {
        to: to,
        from: credentials.email,
        //template: 'add_organiser_email',
        subject: subject,
        text: message
        // context: {
        //  // name:''
        // }
      };
      await smtpTransport.sendMail(data, function(err) {
        if (!err) {
           console.log('message sent')
           return true
        } else {
          console.log(err)
          return false
        }
      });
  }
}