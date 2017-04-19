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

app.use(bodyParser.urlencoded({ extended: true }));
require('./config/passport')(passport);
//app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

app.use("/styles", express.static(__dirname+'/stylesheets'));
app.use("/scripts",express.static(__dirname+'/javascripts'));
app.use("/images", express.static(__dirname+'/images'));
app.use("/node_modules", express.static(__dirname+'/node_modules'));

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.set('view engine', 'ejs'); // set up ejs for templating



//app.use(bodyParser.json()); // for parsing application/json
app.set('views', __dirname + '/views');

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

    app.post('/login', function(req, res, next) {
      passport.authenticate('local-login', function(err, user, info) {
        if (err){ 
            return next(err);
        }
        // Redirect if it fails
        if (!user){ 
            return res.redirect('/login'); 
        }
        req.login(user, function(err) {
            if (err){ 
                return next(err);
            }
            // Redirect if it succeeds
            if(isAdminBool(req)){
                return res.redirect('/adminHome');
            }
            else{
                return res.redirect('/home');
            }
        });
      })(req, res, next);
    });
    // process the login form
    /*
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
*/

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
        successRedirect : '/home',
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

function isAdminNext(req, res, next){
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

function isAdminBool(req){
    if (req.isAuthenticated()){
        if(req.user.admin){
            console.log('user Is Admin');
            return true;
        }
        console.log('user is not Admin');
        return false;
    }
    else{
        return false;
    }
}
//----------------------------------------------------------
//						Database Ops
//----------------------------------------------------------
app.post('/testingForm', function(req,res){
    console.log(req.body);
});


app.get('/db/testing', function(req,res){
	console.log("Calling testing script...");
	databaseOperations.testing(req,res);
});



//games table functions
app.post('/db/getAllGames', function(req,res){
    console.log("Calling getAllGames script...");
    databaseOperations.getAllGames(req,res);
});

app.post('/db/getGameById', function(req,res){
    console.log("Calling getGameById script...");
    databaseOperations.getGameById(req,res);
});

app.post('/db/addGame', function(req,res){
    console.log("Calling addGame script...");
    databaseOperations.addGame(req,res);
});

//order_history table functions
app.post('/db/getAllOrderHistory', function(req,res){
    console.log("Calling getAllOrderHistory script...");
    databaseOperations.getAllOrderHistory(req,res);
});

//stores table functions
app.post('/db/getAllStores', function(req,res){
    console.log("Calling getAllStores script...");
    databaseOperations.getAllStores(req,res);
});

app.post('/db/addStore', function(req,res){
    console.log("Calling addStore script...");
    databaseOperations.addStore(req,res);
});

//store_stock table functions
app.post('/db/getAllStoreStock', function(req,res){
    console.log("Calling getAllStoreStock script...");
    databaseOperations.getAllStoreStock(req,res);
});

app.post('/db/getStoresAndStock', function(req,res){
    console.log("Calling getStoresAndStock script...");
    databaseOperations.getStoresAndStock(req,res);
});

app.post('/db/deleteItem/:table/:itemId', function(req,res){
    var table;
    if(req.params.table == 1)
        table = 'games';
    else if(req.params.table == 2)
        table = 'order_history';
    //DEAL WITH THIS LATER
    else if(req.params.table == 3)
        table = 'store_stock';
    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    else if(req.params.table == 4)
        table = 'stores';
    
    console.log("Deleting Item #%d from table %s", req.params.itemId, table);
    databaseOperations.deleteItem(req,res,req.params.table,req.params.itemId);
});

app.post('/db/deleteStockItem/:gameId/:storeId', function(req,res){
    console.log("Deleting Game: %d from Store: %d from table store_stock", req.params.gameId, req.params.storeId);
    databaseOperations.deleteStockItem(req,res,req.params.gameId,req.params.storeId);
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
    if(req.user.admin){
        res.sendFile(path.join(__dirname+'/views/stores.html'));
    }
    else{
        res.sendFile(path.join(__dirname+'/views/shoppingCart.html'));
    }
});

//Admin views for editing the database entries
app.get('/adminHome', isAdminNext, function(req,res){
    res.sendFile(path.join(__dirname+'/views/adminHome.html'));
});

app.get('/gameCatalogEdit', isAdminNext, function(req,res){
    res.sendFile(path.join(__dirname+'/views/gameCatalogEdit.html'));
});

app.get('/storesEdit', isAdminNext, function(req,res){
    res.sendFile(path.join(__dirname+'/views/storesEdit.html'));
});

app.get('/orderHistory', isAdminNext, function(req,res){
    res.sendFile(path.join(__dirname+'/views/orderHistory.html'));
});

var server = app.listen(8080, function () {
  var port = server.address().port;

  console.log('Listening at http://%s', port);
});