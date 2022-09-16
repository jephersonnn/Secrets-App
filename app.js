//jshint esversion:6
require('dotenv').config(); //to require dotenv
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport'); //passportjs.org/docs
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(session({ //uses EXPRESS-SESSION
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); //initialize the passport package
app.use(passport.session()); //use the session for running passport

mongoose.connect("mongodb://localhost:27017/userDB");
//mongoose.set("useCreateIndex", true); //eliminates the deprication warning for express-session
// -------------------------------USER SCHEMA-------------------------------
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
userSchema.plugin(passportLocalMongoose); //passportLocal will do the hashing and salting

const User = mongoose.model("User", userSchema);

//passport.user(MODEL.createStrategy());
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      })
    }
  }) //uses passportLocal
})
// ---------------------------------LOGIN-----------------------------------

// --------------------------------LOGOUT-----------------------------------
app.get("/logout", function(req, res) {
  req.logout(function() {}); //uses passportLocal, requires callback function
  res.redirect("/");
})
// --------------------------------LOGOUT-----------------------------------

// --------------------------------REGISTER---------------------------------
app.get("/register", function(req, res) {
  res.render("register.ejs");
})

app.post("/register", function(req, res) {
  User.register({ //uses passportLocal
    username: req.body.username
  }, req.body.password, function(err, registeredUser) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() { //if registration is successful
        res.redirect("/secrets");
      })
    }

  }) //uses passportLocalMongoose middleware
})
// --------------------------------REGISTER---------------------------------

// --------------------------------SECRETS-----------------------------------
app.get("/secrets", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets.ejs");
  } else {
    res.redirect("/login");
  }
})

// --------------------------------SECRETS-----------------------------------



// --------------------------------GENERAL----------------------------------
app.listen(port, function(req, res) {
  console.log("Server started on port " + port + ".");
})
// --------------------------------GENERAL----------------------------------
