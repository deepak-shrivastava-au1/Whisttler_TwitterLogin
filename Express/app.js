'use strict'

// npm packages
var express = require("express");
var bodyParser = require("body-parser");
var mongoClient = require("mongodb");
var session = require("express-session");
var Twit = require('twit');
var config = require('./config.js');

var app = express();

// Setting Handlebars Template Engine
app.set("view engine", "hbs");

// bodyParser for form data
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Static files
app.use(express.static('views'));

// Setting express session
app.use(session({secret: "catkey"}));

var DB;
var mongoClient = new mongoClient.MongoClient("mongodb://127.0.0.1:27017/AdminAuth", {useNewUrlParser: true, useUnifiedTopology: true } );
mongoClient.connect(function(error) {
    if(error) {
        console.log("error connecting  to the DB");
        return; 
    }
    else {
        console.log("Connected to DB");
        DB = mongoClient.db("AdminAuth");
    }
});

app.get("/", function(request, response){
    response.render('auth.hbs');
});

app.get("/signup", function(req, res) {
    res.render("signup.hbs");
})

app.post("/signup", function(req, res) {
    var user = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
    }
    DB.collection("users").insertOne(user, function(error){
        
        if(error) {
            res.send("error occured while signup");
        }
        else {
            res.send("Registered Successfully : Please go to Admin Login");
            res.redirect("/login");
        }
    })
})
//Login Page Route
app.get("/login", function(request, response){
    response.render("login.hbs");
});

// Login Page Post Route
app.post("/login", function(request, response) {

    var userDetails = {
        username: request.body.username,
        password: request.body.password
    };
// Check the user's credential from Local Database for Admin users only
DB.collection("users").findOne(userDetails, function(error, user){
    console.log(user);
    if(error) {
        response.send("DB Error");
        return;
    } 
    // if user not matched redirect to the login page itself
    if(!user){
        console.log(user);
        response.redirect("/login");
        return;
    }
    // if user found redirect to the admin dashboard.
    else {
        console.log(user);
    request.session.user = user;
    response.redirect("/dashboard"); 
    }
})

app.get("/logout", function(req, res) {
    request.session.user = null;
    res.redirect("auth.hbs");
})
app.get("/dashboard", function(req, res) {
    res.render("dashboard");
})
});

//var T = new Twit(config);

//Signin the user and generate the token
app.post('/auth/twitter/login', function(req, res) {
	request.post({
		url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
		oauth: {
			consumer_key: config.consumerKey,
			consumer_secret: config.consumerSecret,
			token: req.query.oauth_token
		},
		form: { oauth_verifier: req.query.oauth_verifier }
	}, function (err, r, body) {
		if (err) {
			return res.send(500, { message: err.message });
		}

		const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
		const parsedBody = JSON.parse(bodyString);
		res.json(parsedBody);
	});
});

let port = 8000;
app.listen(port, function(req, res) {
    console.log("App is running on port no. --->", port);
});