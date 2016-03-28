// Made by Cr4xy - Helped by MastaCoder :)
// https://www.youtube.com/channel/UC1CJCNc6rrtjJzxiqYN97aQ - Support Cr4xy's YouTube!

var agarClient = require("agario-client")
	config = require("./config.js"),
	token = null,
	account = new agarClient.Account(),
	STATIC_NAME = config.name,
	debugObj = {},
	regions = config.regions,
	DefaultAi = new (require("./ai/default_ai.js")),
	AposAi = new (require("./ai/apos_ai.js"));

var VERSION = 0.95;

var currentSeconds = 0; // Starts at 0
var accountIndex = 0; // Gives number to each token and account.
var accountCount = 0; // Gives number of attempted accounts.
var regionCounter = 0; // Give number to each region.
var requestTries = 0; // Requests to get the server tokens.
var consoleFix = false; // Adds spaces to remove extra numbers.

Array.prototype.contains = function(element) {
	return this.indexOf(element) >= 0;
}
Array.prototype.add = Array.prototype.push;
Array.prototype.remove = function(element) {
	if (this.contains(element)) this.splice(this.indexOf(element), 1);
}

// Check if no region is enabled
!function() {
	if (config.regions.length > 0) return;
	console.log("No region enabled or found. oh well");
	process.exit();
}();

// Check for updates
!function() {
	require("https").get('https://raw.githubusercontent.com/Cr4xy/agar-lvlgen/master/version', function(res) {
		res.on('data', function (bytes) {
			var fetched_version = bytes.toString();

			console.log("\u001B[31m\n########################");
			console.log("\u001B[32m    _                         _         _  ____");
			console.log("   / \\   __ _  __ _ _ __     | | __   _| |/ ___| ___ _ __");
			console.log("  / _ \\ / _` |/ _` | '__|____| | \\ \\ / / | |  _ / _ \\ '_ \\ ");
			console.log(" / ___ \\ (_| | (_| | | |_____| |__\\ V /| | |_| |  __/ | | |");
			console.log("/_/   \\_\\__, |\\__,_|_|       |_____\\_/ |_|\\____|\\___|_| |_|");
        	console.log("	|___/ \u001B[33m- Open Source Agar.io Level Farming! \u001B[0m\n");
			
			if (!isNaN(fetched_version) && isFinite(fetched_version)) {
				if (VERSION < fetched_version) {
					console.log("Running version: " + VERSION + " (New version " + fetched_version + " found, download off agar-lvlgen Github repo)");
				} else {
					console.log("Running version: " + VERSION + " (Latest)");
				}
			} else {
				console.log("Running version: " + VERSION + " (Failed to fetch)");
			}

			console.log("Will reset in: " + config.reset + " minutes")

			console.log("\n\u001B[31m########################\u001B[0m\n");
		});
	});
}();

function getRegion() {
	regionCounter++;
	if (regionCounter >= regions.length) regionCounter = 0;
	return regions[regionCounter];
}

function getServerOptions() {
	return {region: getRegion()};
}

function requestToken(c_user, datr, xs) {
	account.c_user = c_user || config.accounts[accountIndex].c_user;
	account.datr = datr || config.accounts[accountIndex].datr;
	account.xs = xs || config.accounts[accountIndex].xs;
	
	account.requestFBToken(function(token, info) {
		if (!token) {
			if (requestTries++ >= 5) {
				accountCount++;
				console.log("[ac" + accountCount + "] Token Failed: Token failed after multiple tries.");
				process.exit();
			}
			console.log("[ac" + accountCount + "] Token Failed: Token failed after " + requestTries + " tries, will try again.");
			requestToken();
		} else {
			accountCount++;
			if (config.showtoken) {
				console.log("[ac" + accountCount + "] Token Success: ", token);
			} else {
				console.log("[ac" + accountCount + "] Token Success: Token Hidden!");
			}
			agarClient.servers.getFFAServer(getServerOptions(), function(e) {
				var server = e.server;
				var key = e.key;
				start(server, key, token, account);
			});
			requestTries = 0;
		}
	});
}

// Get token & server, then start
!function getTokenAndServer() {
	setTimeout(function() {
		requestToken();
	}, 500);
	accountIndex++;
	if (accountIndex >= config.accounts.length) {
		accountIndex = 0;
		return;
	}
	getTokenAndServer();
}();

var clientIdCounter = 0;
var bots = [];

function start(server, key, token, acc) {
	var myClient = new agarClient("Client_" + clientIdCounter++);
	myClient.debug = 0;
	myClient.auth_token = token;
	var myBotObj = {spawned: false, client: myClient, account: acc};
	myClient.on('disconnect', function() {
		bots.remove(myBotObj);
		clearInterval(myClient.sendInterval);
		myClient = null;
	});
	myClient.on('packetError', function(packet, error, preventCrash) {
		preventCrash();
	});
	myClient.on('connected', function() {
		bots.add(myBotObj);
		myClient.spawn(STATIC_NAME);
		myClient.sendInterval = setInterval(function() {
			if (config.ai == "default") {				
				DefaultAi.update(myClient);
			} else {
				if (myClient.my_balls.length == 0) return;
				var myBalls = [];
				for (var i in myClient.my_balls) myClient.balls[myClient.my_balls[i]] && (myBalls.push(myClient.balls[myClient.my_balls[i]]));
				AposAi.setPlayer(myBalls);
				AposAi.setMemoryCells(myClient.balls);
				var destination = AposAi.mainLoop(myClient.balls);
				//console.log(destination);
				myClient.moveTo(destination[0], destination[1]);
			}
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
	for (var i = 0; i < bots.length; i++) {
		var acc = bots[i].account;
		if (Date.now() > acc.token_expire) {
			requestToken(acc.c_user, acc.datr, acc.xs)
			bots.remove(bots[i]);
		}
	}
}, 10000);

setInterval(function() {
	currentSeconds++;

    var totalScore = 0;
    var spawnedCount = 0;

    for (var i = 0; i < bots.length; i++) bots[i].spawned && (spawnedCount++, totalScore += bots[i].client.score);
    var avgScore = parseInt((totalScore / Math.max(1, spawnedCount)).toFixed(0));

    if (config.reset > 0) {
        var inSeconds = config.reset * 60;
        if (currentSeconds >= inSeconds && avgScore < 100) {
            process.exit();
        }
    }
}, 1000);

setTimeout(function() {
	console.log(" ");
	// Live console developed by MastaCoder!
	if (config.liveConsole == true) {
		console.log("\u001B[33mLive Console: \u001B[0m");
		console.log("---------------------------------------------------------------------")
	}
}, config.statusDelay - 0.001);

setInterval(function() {
	consoleFix = true;
}, 10000);

setInterval(function() {
	var totalScore = 0;
	var spawnedCount = 0;
	var highestScore = 0;
	for (var i = 0; i < bots.length; i++) bots[i].spawned && (spawnedCount++, totalScore += bots[i].client.score, highestScore = Math.max(highestScore, bots[i].client.score));
	var avgScore = parseInt((totalScore / Math.max(1, spawnedCount)).toFixed(0));

	debugObj.connected = bots.length;
	debugObj.spawned = spawnedCount;
	debugObj.totalScore = totalScore;
	debugObj.avgScore = avgScore;
	debugObj.highest = highestScore;
	debugObj.time = currentSeconds;

	// Live console developed by MastaCoder!
	if (config.liveConsole == true) {
		if (consoleFix != true) {
			process.stdout.write("\rSpawned: " + spawnedCount + " | Total: " + totalScore + " | Average: " + avgScore + " | Highest: " + highestScore + " | Time: " + currentSeconds);
		} else {
			process.stdout.write("\rSpawned: " + spawnedCount + " | Total: " + totalScore + " | Average: " + avgScore + " | Highest: " + highestScore + " | Time: " + currentSeconds + "    ");
			consoleFix = false;
		}
	} else {
		console.log(debugObj);
	}

}, config.statusDelay);
