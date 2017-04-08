var express 			= require('express'),
	app 				= express(),
	request 			= require('request'),
	path 				= require('path'),
	http 				= require('http'),
	bodyParser 			= require('body-parser'),
	databaseOperations 	= require('./javascripts/databaseOperations.js');

//var port     	= process.env.PORT || 8080;
var passport 	= require('passport');
var flash    	= require('connect-flash');
var morgan      = require('morgan');
var cookieParser= require('cookie-parser');
var session     = require('express-session');
var pg          = require('pg');
var config      = require('./config/config.js');
var conString   = "pg://"+ config.username + ":"+ config.password+"@"+config.host+":5432/postgres";

require('./config/passport')(passport);
//app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

app.use("/styles", express.static(__dirname+'/stylesheets'));
app.use("/scripts",express.static(__dirname+'/javascripts'));
app.use("/images", express.static(__dirname+'/images'));
app.use("/node_modules", express.static(__dirname+'/node_modules'));

app.set('views', __dirname + '/views');

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

var User = require('./app/models/user');

//----------------------------------------------------------
//						User Auth and Login
//----------------------------------------------------------
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/studentPages',
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        console.log('isLoggedin');
        return next();
    }
    console.log('is not logged in');
    // if they aren't redirect them to the home page
    res.redirect('/');
}

function isAdmin(req, res, next){
    if (req.isAuthenticated()){
        if(req.user.admin){
            console.log('user Is Admin');
            return next();
        }
        console.log('user is not Admin');
        res.redirect('/home');
    }
    else{
        res.redirect('/');
    }
}
//----------------------------------------------------------
//						Database Ops
//----------------------------------------------------------
app.get('/db/testing', function(req,res){
	console.log("Calling testing script...");
	databaseOperations.testing(req,res);
});

//----------------------------------------------------------
//							Views
//----------------------------------------------------------
app.get('/home', isLoggedIn, function(req,res){
	res.sendFile(path.join(__dirname+'/views/home.html'));
});

app.get('/gameCatalog', isLoggedIn, function(req,res){
    res.sendFile(path.join(__dirname+'/views/gameCatalog.html'));
});

app.get('/stores', isLoggedIn, function(req,res){
    res.sendFile(path.join(__dirname+'/views/stores.html'));
});

app.get('/shoppingCart', isLoggedIn, function(req,res){
    res.sendFile(path.join(__dirname+'/views/shoppingCart.html'));
});

var server = app.listen(8080, function () {
  var port = server.address().port;

  console.log('Listening at http://%s', port);
});