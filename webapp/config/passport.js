//configuring the strategies for passport
var LocalStrategy  = require('passport-local').Strategy;
var pg     = require('pg');
var bcrypt = require('bcryptjs');

// load up the user model
var User   = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log('Serialize User: ' + user.user_id);
        done(null, user.user_id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log('Deserialize user: ' + id);
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            console.log("Got into the signup");
            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function(callback) {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne(email, function(err, isNotAvailable, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);
                    // check to see if theres already a user with that email
                    if (isNotAvailable == true) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        // if there is no user with that email
                        // create the user
                        user          = new User();
                        // set the user's local credentials
                        user.email    = req.body.email;
                        //console.log(req.body.password);
                        user.password = User.generateHash(req.body.password);
                        user.name = req.body.name;
                        user.save(function(newUser) {
                            passport.authenticate();
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne(email, function(err, userTaken, userObj) {
                // if there are any errors, return the error before anything else;
                if (err)
                    return done(err);
                // if no user is found, return the message
                if (!userTaken)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, userObj.password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                // all is well, return successful user
                return done(null, userObj);
            });
        }));
    };