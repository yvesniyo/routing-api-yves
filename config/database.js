//Set up mongoose connection
const mongoose = require('mongoose');
//const mongoDB = 'mongodb+srv://yvesapi:myECVrPTq3naSRAI@cluster0-gj93l.azure.mongodb.net/map?retryWrites=true&w=majority';
const mongoDB = 'mongodb://localhost/map';
mongoose.connect(mongoDB,{ useNewUrlParser: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;
/*const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));*/