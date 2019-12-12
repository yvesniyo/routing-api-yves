//Set up mongoose connection
const mongoose = require('mongoose');
const globals = require("./globals")
mongoose.connect(globals.mongoDB,{ useNewUrlParser: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;
/*const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));*/