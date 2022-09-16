//jshint esversion:6
require('dotenv').config(); //to require dotenv
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
//const md5 = require("md5"); //hash
const bcrypt = require("bcrypt");
const saltRounds = 12;

const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

mongoose.connect("mongodb://localhost:27017/userDB");

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}))

// -------------------------------USER SCHEMA-------------------------------
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});


//userSchema.plugin(encrypt, {secret: process.env.SECRET_KEY, excludeFromEncryption: ["email"], encryptedField: ["password"]});
//mongoose-encryption plugin line to encrypt.
//secret is an authentication key used to encrypt fields referenced by encryptedField
//excluding fields specified on excludeFromEncryption
//When using .find, Mongoose automatically decrypts it

const User = mongoose.model("User", userSchema);
// -------------------------------USER SCHEMA-------------------------------

// ----------------------------------HOME-----------------------------------
app.get("/", function(req, res) {
  res.render("home.ejs");
})
// ----------------------------------HOME-----------------------------------



// ---------------------------------LOGIN-----------------------------------
app.get("/login", function(req, res) {
  res.render("login.ejs");
})

app.post("/login", function(req, res) {
  User.findOne({
    email: req.body.username,
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(req.body.password, foundUser.password, function(err,result){
          if (result === true){
            console.log("Logged in successfully");
            res.render("secrets.ejs");
          }
        })
        // if (foundUser.password === req.body.password) { //hash the password in MD5 for an attempt
        //
        // }
      }
    }
  })
})
// ---------------------------------LOGIN-----------------------------------




// --------------------------------REGISTER---------------------------------
app.get("/register", function(req, res) {
  res.render("register.ejs");
})

app.post("/register", function(req, res) {
  console.log(req.body.username);
  console.log(req.body.password);

  bcrypt.hash(req.body.password, saltRounds, function(err, hash){ //bcrypt encryption

      const newUser = new User({
        email: req.body.username,
        password: hash
        //password: md5(req.body.password) //hashing the password in md5
      });

      newUser.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          res.render("secrets.ejs");
            console.log("Registered and logged-in successfully");
        }
      })
  });

})
// --------------------------------REGISTER---------------------------------



// --------------------------------GENERAL----------------------------------
app.listen(port, function(req, res) {
  console.log("Server started on port " + port + ".");
})
// --------------------------------GENERAL----------------------------------
