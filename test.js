var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://chatBoxGroup:ZnoCVIJmXqB5V4Aa@chatbox.rxzqy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("chatBox");
  const { username, password } = req.body
  const user = dbo.collection("users").findOne({ username }).lean()
  console.log(user)


  //dbo.collection("users").findOne({"fakeUser"}).toArray(function(err, result) {
  //  if (err) throw err;
  //  console.log(result);
  //  db.close();
  //});
});