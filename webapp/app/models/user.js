var pg = require('pg');
var bcrypt = require('bcryptjs');
var config = require('../../config/config.js');
var conString = "pg://"+ config.username + ":"+ config.password+"@"+config.host+"/postgres";

var client = new pg.Client(conString);

function User(){
    this.user_id = 0;
    this.email = "";
    this.password = ""; //need to declare the things that I want to be remembered for each user in the database
    this.name = "";
    this.shoppingCart = "";
    this.admin = false;
    //this.teacher = false;
    //this.voted = false;
    this.save = function(callback) {
        var client = new pg.Client(conString);
        client.connect();
        console.log(this.email +' will be saved');
        client.query('INSERT INTO users(email, password, name) VALUES($1, $2, $3)', [this.email, this.password, this.name], function (err, result) {
            console.log("---Trying to insert new user into the user table---");
            if(err){
                console.log(err);
                return console.error('error running query', err);
            }
            console.log(result.rows);
            //console.log(this.email);
        });
        client.query('SELECT * FROM users ORDER BY user_id desc limit 1', null, function(err, result){

            if(err){
                return callback(null);
            }
            //if no rows were returned from query, then new user
            if (result.rows.length > 0){
                console.log(result.rows[0] + ' is found!');
                var user = new User();
                user.email= result.rows[0]['email'];
                user.password = result.rows[0]['password'];
                user.user_id = result.rows[0]['user_id'];
                user.name = result.rows[0]['name'];
                user.admin = result.rows[0]['admin'];
                //user.voted = result.rows[0]['voted'];
                console.log(user.email);
                client.end();
                return callback(user);
            }
        });
    };
}

User.findOne = function(email, callback){
    //var conString = "pg://"+ config.username + ":"+ config.password+"@"+config.host+":5432/CellTMS";
    var client = new pg.Client(conString);
    var isNotAvailable = false; //we are assuming the email is taking
    //var email = this.email;
    //var rowresult = false;
    // console.log(email + ' is in the findOne function test');
    //check if there is a user available for this email;
    client.connect();
    //client.connect(function(err) {
    ////    //console.log(this.photo);
    //    console.log(email);
    //    if (err) {
    //        return console.error('could not connect to postgres', err);
    //    }

    client.query("SELECT * from users where email=$1", [email], function(err, result){
        // console.log(email + ' inside the query of findOne');
        if(err){
            return callback(err, isNotAvailable, this);
        }
        //if no rows were returned from query, then new user
        if (result.rows.length > 0){
            isNotAvailable = true; // update the user for return in callback
            ///email = email;
            //password = result.rows[0].password;
            console.log(email + ' is not available!');
        }
        else{
            isNotAvailable = false;
            //email = email;
            console.log(email + ' is available');
        }
        //the callback has 3 parameters:
        // parameter err: false if there is no error
        // parameter isNotAvailable: whether the email is available or not
        // parameter this: the User object;

        client.end();
        //console.log(result);
        // console.log(result.rows);
        //console.log('Pass: ' + result.rows[0].password);
        return callback(false, isNotAvailable, result.rows[0]);
    });
//});
};

User.findById = function(id, callback){
    var client = new pg.Client(conString);

    client.connect();
    client.query("SELECT * from users where user_id=$1", [id], function(err, result){
        if(err){
            return callback(err, null);
        }
        //if no rows were returned from query, then new user
        if (result.rows.length > 0){
            //console.log(result.rows[0] + ' is found!');
            var user = new User();
            user.email= result.rows[0]['email'];
            user.password = result.rows[0]['password'];
            user.user_id = result.rows[0]['user_id'];
            user.name = result.rows[0]['name'];
            user.admin = result.rows[0]['admin'];
            //user.voted = result.rows[0]['voted'];
            //console.log(user.email);
            return callback(null, user);
        }
    });
};

User.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
};

User.validPassword = function(password){
    console.log("Password in validPass: " + password);
    console.log("this.pass in validPass: " + User.password);
    console.log(bcrypt.compareSync(password, User.password));
    return bcrypt.compareSync(password, this.password);
};
//User.connect = function(callback){
//    return callback (false);
//};

//User.save = function(callback){
//    return callback (false);
//};

module.exports = User;