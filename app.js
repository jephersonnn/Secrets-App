//jshint esversion:6
require('dotenv').config(); //to require dotenv
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport'); //passportjs.org/docs
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate')
const GoogleStrategy = require('passport-google-oauth20').Strategy;

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
  password: String,
  googleId: String,
  secretNote: String
});
userSchema.plugin(passportLocalMongoose); //passportLocal will do the hashing and salting
userSchema.plugin(findOrCreate); //to use findOrCreate

const User = mongoose.model("User", userSchema);

//passport.user(MODEL.createStrategy());
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//passport Google Auth set-up
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets", //should match the configuration on the Google Console
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo" //to counter Google+ deprecation
}, function(accessToken, resfreshToken, profile, cb) {
  User.findOrCreate({
    googleId: profile.id //This is ID could be essential to identify users if they are existing or not
  }, function(err, user) {
    return cb(err, user);
  });
})); //google strategy options

// -------------------------------USER SCHEMA-------------------------------

// ----------------------------------HOME-----------------------------------
app.get("/", function(req, res) {
  res.render("home.ejs");
})

app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile"]
}))
//passport.authenticate("strategy", scope: [data], callback)


app.get("/auth/google/secrets", passport.authenticate("google", {
    failureRedirect: "/login"
  }),
  function(req, res) {
    res.redirect("/secrets"); //successful authentication
  });
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
  User.find({
    "secretNote": {
      $ne: null
    }   //.find({filter:{condition}})
      //remember the comparators for mongoDB. $ne = not equal
  }, function(err, foundSecrets) {
    if (err) {
      console.log(err);
    } else {
      if (foundSecrets) {
        res.render("secrets", {
          usersWithSecrets: foundSecrets
        })
      }
    }
  })

})


// --------------------------------SECRETS-----------------------------------

// --------------------------------SUBMIT-----------------------------------

app.get("/submit", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("submit.ejs");
  } else {
    res.redirect("/login");
  }
})

app.post("/submit", function(req, res) {
  console.log(req.user.id);

  User.findById(req.user.id, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secretNote = req.body.secret;
        foundUser.save(function(err) {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/secrets");
          }
        })
      }
    }
  })
});

// --------------------------------SUBMIT-----------------------------------

// --------------------------------GENERAL----------------------------------
app.listen(port, function(req, res) {
  console.log("Server started on port " + port + ".");
})
// --------------------------------GENERAL----------------------------------
