
// Made by Cr4xy
// https://www.youtube.com/channel/UC1CJCNc6rrtjJzxiqYN97aQ

var agarClient = require("agario-client")
	config = require("./config.js"),
	token = null,
	account = new agarClient.Account(),
	STATIC_NAME = config.name,
	debugObj = {},
	regions = config.regions;

var VERSION = 0.9;

account.c_user = config.c_user;
account.datr = config.datr;
account.xs = config.xs;

Array.prototype.contains = function(element) {
	return this.indexOf(element) >= 0;
}
Array.prototype.add = Array.prototype.push;
Array.prototype.remove = function(element) {
	if (this.contains(element)) this.splice(this.indexOf(element), 1);
}

// Check if no mode/server is enabled
!function() {
	var serverFound = false,
		regionFound = config.regions.length > 0;
	for (var i in config.servers) serverFound = (serverFound || config.servers[i]);
	if (serverFound && regionFound) return;
	console.log("No mode/region enabled or found. oh well");
	process.exit();
}();

// Check for updates
!function() {
	require("https").get('https://raw.githubusercontent.com/Cr4xy/agar-lvlgen/master/version', (res) => {
		res.on('data', function (bytes) {
			var fetched_version = bytes.toString();
			
			console.log("########################\n\nUpdate-Check\n\n");
			
			if (!isNaN(fetched_version) && isFinite(fetched_version)) {
				if (VERSION < fetched_version)
					console.log("An update (" + fetched_version + ") is available!\nPlease update the script at https://github.com/Cr4xy/agar-lvlgen");
				else
					console.log("No new version available.");
			} else {
				console.log("Unable to fetch new version.");
			}
			
			console.log("\n\n########################\n\n");
			
		});
		//res.resume();
	});
}();

// Get token
var requestTries = 0;
var requestToken = function() {
	account.requestFBToken(function(tkn, info) {
		token = tkn;
		if (!token) {
			if (requestTries++ >= 5) {
				console.log("Got no token multiple times, please check your cookies.");
				process.exit();
			}
			console.log("Got no token! Trying again... (Attempt " + requestTries + ")");
			requestToken();
		} else {
			console.log("Got token:", token);
			requestTries = 0;
		}
	});
}
requestToken();

var regionCounter = 0;
function getRegion() {
	regionCounter++;
	if (regionCounter >= regions.length) regionCounter = 0;
	return regions[regionCounter];
}

function getServerOptions() {
	return {region: getRegion()};
}

var spawnTask;
function grabServers() {
	if (token == null) return;
	
	function callBack(e) {
		var server = e.server;
		var key = e.key;
		start(server, key);
	}
	
	if (config.servers.ffa) {
		agarClient.servers.getFFAServer(getServerOptions(), callBack);
	}
	
	if (config.servers.teams) {
		agarClient.servers.getTeamsServer(getServerOptions(), callBack);
	}
	
	if (config.servers.experimental) {
		agarClient.servers.getExperimentalServer(getServerOptions(), callBack);
	}
	
	if (config.servers.party) {
		agarClient.servers.createParty(getServerOptions(), function(e) {
			var server = e.server;
			var key = e.key; // Key = Party Code
			start(server, "");
		});
	}
	if (bots.length >= config.botLimit) clearInterval(spawnTask);
}

spawnTask = setInterval(grabServers, config.spawnDelay);

var clientIdCounter = 0;
var bots = [];

function start(server, key) {
	var myClient = new agarClient("Client_" + clientIdCounter++);
	myClient.debug = 0;
	myClient.auth_token = token;
	var myBotObj = {spawned: false, client: myClient};
	myClient.on('disconnect', function() {
		bots.remove(myBotObj);
		clearInterval(myClient.sendInterval);
		myClient = null;
	});
	myClient.on('packetError', function(packet, error, preventCrash) {
		preventCrash();
	});
	myClient.on('connected', function() {
		if (bots.length >= config.botLimit) {
			myClient.disconnect();
			return;
		}
		bots.add(myBotObj);
		myClient.spawn(STATIC_NAME);
		myClient.sendInterval = setInterval(function() {
			function getDistance(cell1, cell2) {
				return Math.sqrt(Math.pow(cell1.x - cell2.x, 2) + Math.pow(cell2.y - cell1.y, 2));
			}
			var player = myClient.balls[myClient.my_balls[0]];
			if (!player) return;
			var nearest = null, nearestDist = 1000;
			for (var id in myClient.balls) {
				if (myClient.my_balls.indexOf(id) != -1) continue;            // Skip own cell
				var cell = myClient.balls[id];
				if (cell.virus) continue;                                     // Skip virus
				if (cell.size * 1.25 > player.size) continue;                 // Skip bigger cells
				
				var dist = getDistance(cell, player);
				if (nearest && nearestDist < dist) continue;                  // Skip cells far away
				if (nearest && nearest.size > 20 && cell.size < 20) continue; // Skip food when found a player or ejected mass
				
				if (cell.size > 20 && cell.size * 4 < player.size) continue;  // Skip players smaller than 4th or something
				
				nearest = cell;
				nearestDist = dist;
			}
			if (!nearest) return;
			
			myClient.moveTo(nearest.x, nearest.y);
		}, 40);
	});
	myClient.on('myNewBall', function() {
		myBotObj.spawned = true;
	});
	myClient.on('lostMyBalls', function() {
		myBotObj.spawned = false;
		myClient.spawn(STATIC_NAME);
	});
	myClient.connect("ws://" + server, key);
}

setInterval(function() {
	if (Date.now() > account.token_expire) {
		for (var i in bots) bots[i].client.disconnect();
		requestToken();
		spawnTask = setInterval(grabServers, config.spawnDelay);
	}
}, 10000);

setInterval(function() {
	if (!token) return;
	var totalScore = 0;
	var spawnedCount = 0;
	var highestScore = 0;
	for (var i in bots) bots[i].spawned && (spawnedCount++, totalScore += bots[i].client.score, highestScore = Math.max(highestScore, bots[i].client.score));
	var avgScore = parseInt((totalScore / Math.max(1, spawnedCount)).toFixed(0));
	debugObj.connected = bots.length;
	debugObj.spawned = spawnedCount;
	debugObj.totalScore = totalScore;
	debugObj.avgScore = avgScore;
	debugObj.highest = highestScore;
	console.log(debugObj);
}, config.statusDelay);
