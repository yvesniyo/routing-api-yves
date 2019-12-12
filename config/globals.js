// Localhost

const host = "http://127.0.0.1:1000/";
const dbUriSessions = "mongodb://localhost:27017/connect_mongodb_session_test";
const mongoDB = 'mongodb://localhost/map';

// Online

// const host = "https://api-testing-yves.herokuapp.com/";
//const dbUriSessions ='mongodb+srv://yvesapi:myECVrPTq3naSRAI@cluster0-gj93l.azure.mongodb.net/connect_mongodb_session_test?retryWrites=true&w=majority',
//const mongoDB = 'mongodb+srv://yvesapi:myECVrPTq3naSRAI@cluster0-gj93l.azure.mongodb.net/map?retryWrites=true&w=majority';


module.exports = {
	host : host,
	dbUriSessions : dbUriSessions,
	mongoDB : mongoDB
}