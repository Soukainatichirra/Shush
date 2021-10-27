//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
const app = express();
//const md5 = require("md5");
//const bcrypt = require("bcrypt");
// const saltRounds = 10 ;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(session({
  secret: "mysecret",
  resave: false,
  saveUnitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(encrypt, {secret:process.env.SECRET , encryptedFields: ["password"]});
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const user = new User({
  email: "ah@gmail.com",
  password: "ah",
  secret: "pf"
});
user.save();
app.get("/login",function(req,res){
  res.render("login");
});
app.get("/",function(req,res){
  res.render("home");
});
app.get("/register",function(req,res){
  res.render("register");
});
app.get("/secrets",function(req,res){
  User.find({"secret" : {$ne: null}}, function(err,foundUsers){
    if(err){
      console,log(err);
    }else{
      res.render("secrets",{usersWithSecrets: foundUsers});
    }


});
});
app.get("/submit",function(req,res){
  if(req.isAuthenticated()){
    res.render("submit");
  }else{
    res.redirect("/login");
  }
});

app.post("/register", function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});
  // bcrypt.hash(req.body.password, saltRounds, function(err,hash){
  //   const newUser = new User({
  //     email: req.body.username,
  //     password: hash
  //   });
  //   newUser.save(function(err){
  //     if(err){
  //       console.log(err);
  //     }else{
  //       console.log("successfuly added new user to userDB");
  //       res.render("secrets");
  //     }
  //   });
  // });






  app.post('/login', passport.authenticate('local', { successRedirect: '/secrets',
                                                    failureRedirect: '/login' }));
app.post("/submit",function(req,res){
  const submittedSecret = req.body.secret ;
  const userId = req.user.id ;
  console.log(userId);
  User.findById(userId, function(err, foundUser){
    if(err){
     console.log(err);
   }else{
     foundUser.secret = submittedSecret ;
     foundUser.save(function(){
       res.redirect("/secrets");
     });
   }
 });
});
  // const username = req.body.username ;
  // const password = req.body.password ;
  // User.findOne({email:username}, function(err,foundUser){
  //
  //   if(err){
  //     console.log(err);
  //   }else{
  //   if(foundUser){
  //     bcrypt.compare(password, foundUser.password, function(err,response){
  //        if(response===true){
  //          res.render("secrets");
  //
  //        }else{
  //          console.log(err);
  //        }
  //     });
  //   }
  //
  //   }
  // });


app.listen(3000, function(){
  console.log("server beng served on port 3000");
});
