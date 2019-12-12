var HashTable = require("./hashTable");
console.log(HashTable);
// var hashT = new HashTable();
  


// function makeid(len=0) {
//     var text = "";
//     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     len = (len > possible.length ) ? possible.length : len;
//     for (var i = 0; i < 10; i++)
//       text += possible.charAt(Math.floor(Math.random() * len));
//     return text;
//   }
// let datas =[];

// for(let i = 0; i < 100000; i++){
//     datas.push(makeid());
// }
// console.time("SETHAsh");
// for(let i = 0; i < 100000; i++){
//     hashT.insert(datas[i], datas[i]);
// }
// console.timeEnd("SETHAsh");

// console.time("SETJS");
// var jsObj ={};
// for(let i = 0; i < 100000; i++){
//     jsObj[datas[i]] = datas[i];
// }
// console.timeEnd("SETJS");

// console.time("GETHash");
// for(let i = 0; i < 100000; i++){
//     hashT.retrieve(datas[840]);
//     //console.log(b);
// }
// console.timeEnd("GETHash");

// console.time("GETJS");
// for(let i = 0; i < 100000; i++){
//     var a =jsObj[datas[i]];
// }
// console.timeEnd("GETJS");
// hashT.insert("$2b$10$3eNlPmyAHq2wo1KdnoQ2neuTSk7MG7dagyoe3bPeLh/p5/uQ6q14u",4345243);

// console.log("$2b$10$3eNlPmyAHq2wo1KdnoQ2neuTSk7MG7dagyoe3bPeLh/p5/uQ6q14u".length)

// //console.log(hashT.retrieve('yves'));  
