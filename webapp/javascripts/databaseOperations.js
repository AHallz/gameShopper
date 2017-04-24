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
		client.connect();
		client.query("INSERT INTO games (title, cost) values($1, $2)",[req.query.title, req.query.cost]);
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
	getCurrentOrderHistory: function(req,res){
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		var queryOrderHistory = client.query("SELECT * from order_history AS oh, stores as s, games as g WHERE oh.customer_id=$1 AND oh.order_number=$2 s.store_id=oh.store_id AND g.game_id=oh.game_id ORDER BY order_id ASC",[req.user.user_id, req.user.shoppingCartNum]);
		queryOrderHistory.on("row", function(row){
			results.push(row);
		});
		queryOrderHistory.on("end", function(){
			client.end();
			return res.json(results);
		})
	},
	findAndUpdateOrAddSpecificOrder: function(req,res,userId,cartNum){
		console.log("findSpecificOrder");
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		var queryStores = client.query("SELECT * from order_history WHERE order_number = $1 AND customer_id = $2 AND game_id = $3 AND store_id = $4", [cartNum, userId, req.query.gameId, req.query.storeId]);
		queryStores.on("row", function(row){
			results.push(row);
		});
		queryStores.on("end", function(){
			client.end();
			if(results.length > 0){
				module.exports.updateOrderHistory(req,res,userId,cartNum,results[0]['count'],1);
				return res.json(results);
			}
			else{
				module.exports.addToOrderHistory(req,res,userId,cartNum,1);
				return res.json(results);
			}
		})
	},
	addToOrderHistory: function(req,res,userId,cartNum,helperBool){
		console.log("add to order_history")
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();

		client.query("INSERT INTO order_history (order_number, customer_id, game_id, store_id, cost, count) values($1, $2, $3, $4, $5, $6)",[cartNum, userId, req.query.gameId, req.query.storeId, req.query.cost, req.query.count]);
		var query_stores = client.query("SELECT * from order_history ORDER BY order_id ASC");
		query_stores.on("row", function(row){
			results.push(row);
		});
		query_stores.on("end", function(){
			console.log('Item added to order_history table');
			client.end();
			if(helperBool){
				res.end();
			}
			else{
				return res.json(results);
			}	
		})
	},
	updateOrderHistory: function(req,res,userId,cartNum,currCount,helperBool){
		console.log("update to order_history")
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		var tempGameCount = req.query.count;
		client.connect();

		if(parseInt(currCount)+parseInt(req.query.count) > parseInt(req.query.totalGameCount)){
			tempGameCount = req.query.totalGameCount;
		}
		else{
			tempGameCount = parseInt(currCount)+parseInt(req.query.count);
		}
		client.query("UPDATE order_history SET count=$1 WHERE order_number = $2 AND customer_id = $3 AND game_id = $4", [tempGameCount, cartNum, userId, req.query.gameId]);
		var query_stores = client.query("SELECT * from order_history ORDER BY order_id ASC");
		query_stores.on("row", function(row){
			results.push(row);
		});
		query_stores.on("end", function(){
			console.log('Item updated to order_history table');
			client.end();
			if(helperBool){
				res.end();
			}
			else{
				return res.json(results);
			}	
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
	addStore: function(req,res){
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		client.query("INSERT INTO stores (name, location) values($1, $2)",[req.query.name, req.query.location]);
		var query_stores = client.query("SELECT * from stores ORDER BY store_id ASC");
		query_stores.on("row", function(row){
			results.push(row);
		});
		query_stores.on("end", function(){
			console.log('Item added to stores table');
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
	getStoresAndStock: function(req,res){
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		var queryStoreStock = client.query("SELECT * from store_stock AS ss, stores, games WHERE stores.store_id=ss.store_id AND ss.game_id=games.game_id");
		queryStoreStock.on("row", function(row){
			results.push(row);
		});
		queryStoreStock.on("end", function(){
			client.end();
			return res.json(results);
		})
	},
	addGameToStore: function(req,res){
		var results = [];
		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		client.query("INSERT INTO store_stock (game_id, store_id, count) values($1, $2, $3)",[req.query.game_id, req.query.store_id, req.query.count]);
		var query_stores = client.query("SELECT * from store_stock");
		query_stores.on("row", function(row){
			results.push(row);
		});
		query_stores.on("end", function(){
			console.log('Item added to store_stock table');
			client.end();
			return res.json(results);
		})
	},
	deleteItem: function(req,res,tableNum,itemId){
		var results = [];
		var table;
		var idSelect;
		if(tableNum == 1){
			table = 'games';
			idSelect = 'game_id';
		}
		else if(tableNum == 2){
			table = 'order_history';
			idSelect = 'order_id';
		}
		//DEAL WITH THIS LATER
		else if(tableNum == 3){
			table = 'store_stock';
			idSelect = '';
		}
		//^^^^^^^^^^^^^^^^^^^^^^
		else if(tableNum == 4){
			table = 'stores';
			idSelect = 'store_id';
		}

		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		client.query("DELETE FROM "+table+" WHERE "+idSelect+" = $1", [itemId]);
		var query_Locations = client.query("SELECT * from "+table+" ORDER BY "+idSelect+" ASC");
		query_Locations.on("row", function(row){
			results.push(row);
		});
		query_Locations.on("end", function(){
			console.log('Item deleted from %s table',table);
			client.end();
			return res.json(results);
		})
	},
	deleteStoreItem: function(req,res,gameId,storeId){
		var results = [];

		var pg = require('pg');
		var client = new pg.Client(conString);
		client.connect();
		client.query("DELETE FROM store_stock WHERE game_id = $1 AND store_id = $2", [gameId,storeId]);
		var query_Locations = client.query("SELECT * FROM store_stock");
		query_Locations.on("row", function(row){
			results.push(row);
		});
		query_Locations.on("end", function(){
			console.log('Item deleted from store_stock table');
			client.end();
			return res.json(results);
		})
	},

};
