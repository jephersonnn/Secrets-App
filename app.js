//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}

<<<<<<< HEAD
mongoose.connect("mongodb://localhost:27017/userDB");
=======
mongoose.connect("mongodb://localhost:27017");
>>>>>>> bdfab1454d26434f9507b3930546dcd4ce524316

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}))


app.get("/", function(req, res) {
  res.render("home.ejs");
})

app.get("/login", function(req, res) {
  res.render("login.ejs");
})

app.get("/register", function(req, res) {
  res.render("register.ejs");
})

app.listen(port, function(req,res){
  console.log("Server started on port " + port +".");
})
