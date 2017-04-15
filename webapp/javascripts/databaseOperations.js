var config 	= require('../config/config.js');
var User 	= require('../app/models/user');
var pg 		= require('pg');
var bcrypt = require('bcryptjs');
var conString = "pg://"+ config.username + ":"+ config.password+"@"+config.host+":5432/postgres";
module.exports = {
	//---------------------------------------------------------
	//THIS FUNCTION IS FOR TESTING WHATEVER I NEED TO TEST
	//---------------------------------------------------------
	insertSingleUser: function(req,res,fileData) { 
		console.log("Calling insertSingleUser");
		var results = [];
		var client = new pg.Client(conString);
        client.connect();
        
        client.query("SELECT * from users where email=$1", [fileData[0]], function(err, result){
            if(err){
                console.error("read error:  " + err.message);
                res.json({error_code:1,err_desc:error});
                //return callback(err, isNotAvailable, this);
            }
            
            if (result.rows.length > 0){
                //isNotAvailable = true; // update the user for return in callback
                console.log(fileData[0] + ' is not available!');
            }
            //if no rows were returned from query, then new user
            else{
                //isNotAvailable = false;
                console.log(fileData[0] + ' is available');
                var temp = bcrypt.hashSync(fileData[1].trim(), bcrypt.genSaltSync(9));
                var insert_query = client.query('INSERT INTO users(email, password, teacher, voted) VALUES($1, $2, $3, $4)', [fileData[0], temp, fileData[2], false]);
                console.log("---Trying to insert new user into the user table---");
                insert_query.on("row", function(row){
					results.push(row);
				});
				insert_query.on("end", function(){
					client.end();
		            return;
				});
            }
        });
	},
	voteFor: function(req,res) {
		var results = [];
		var client = new pg.Client(conString);
		client.connect();
		var queryVote = client.query("INSERT INTO votes (email, vote, project_id) VALUES($1, $2, $3)", [req.user.email, req.query.page, req.query.currentProject], function(err, result){
			if(err){
                console.error("read error:  " + err.message);
                client.end();
                res.json({error_code:1,err_desc:error});
                //return callback(err, isNotAvailable, this);
            }
            else{
            	var changeVote = client.query("UPDATE users SET voted = true WHERE email = ($1)", [req.user.email]);
            	changeVote.on("end", function(){
					client.end();
		            return res.json(results);
				});
            }
		});
	},
	resetVotes: function(req,res) {
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
        var changeVote = client.query("UPDATE users SET voted = false");
        changeVote.on("end", function(){
			client.end();
		    return;
		});
    },
    getVotingResults: function(req,res,currentProject) {
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		var queryVotingResults = client.query("SELECT * from votes WHERE project_id = ($1) ORDER BY id ASC",[currentProject]);
		queryVotingResults.on("row", function(row){
			results.push(row);
		});
		queryVotingResults.on("end", function(){
			client.end();
			return res.json(results);
		})
	},
	//Everything to deal with the games table
	getAllGames: function(req,res){
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		var queryGames = client.query("SELECT * from games ORDER BY game_id ASC");
		queryGames.on("row", function(row){
			results.push(row);
		});
		queryGames.on("end", function(){
			client.end();
			return res.json(results);
		})
	},
	getGameById: function(req,res){
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		var queryGames = client.query("SELECT * from games WHERE game_id=$1 ORDER BY game_id ASC", [req.body.game_id]);
		queryGames.on("row", function(row){
			results.push(row);
		});
		queryGames.on("end", function(){
			client.end();
			return res.json(results);
		})
	},
	addGame: function(req,res){
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		console.log(req.body);
		console.log(req.query);
		client.connect();
		client.query("INSERT INTO games (title, cost) values($1, $2)",[req.body.title, req.body.cost]);
		var query_games = client.query("SELECT * from games ORDER BY game_id ASC");
		query_games.on("row", function(row){
			results.push(row);
		});
		query_games.on("end", function(){
			console.log('Item added to games table');
			client.end();
			return res.json(results);
		})
	},
	getAllOrderHistory: function(req,res){
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		var queryOrderHistory = client.query("SELECT * from order_history ORDER BY order_id ASC");
		queryOrderHistory.on("row", function(row){
			results.push(row);
		});
		queryOrderHistory.on("end", function(){
			client.end();
			return res.json(results);
		})
	},
	getAllStores: function(req,res){
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		var queryStores = client.query("SELECT * from stores ORDER BY store_id ASC");
		queryStores.on("row", function(row){
			results.push(row);
		});
		queryStores.on("end", function(){
			client.end();
			return res.json(results);
		})
	},
	getAllStoreStock: function(req,res){
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		var queryStoreStock = client.query("SELECT * from store_stock");
		queryGames.on("row", function(row){
			results.push(row);
		});
		queryGames.on("end", function(){
			client.end();
			return res.json(results);
		})
	},

};
