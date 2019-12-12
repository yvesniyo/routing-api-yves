const userModel=require("../models/usersModel")


const reload = function(){
	var apiApps = {};
	return new Promise((resolve,reject)=>{
		userModel.find({},async(error,result)=>{
			if(error) reject(error)
			else
				result.forEach((user,index)=>{
					//console.log(result[0].token);
					apiApps[result[index].token] = {
						"amount" : user.amount,
						"timeExpire" : user.timeExpire,
					}
				})
			resolve(apiApps);
		})	
	})
}

module.exports.reloadUsers = reload;

