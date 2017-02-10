var express = require("express");
var fs = require("fs");
var cookieParser = require("cookie-parser");
var cookieSession = require("cookie-session");
var ejs = require("ejs");
var mongo = require("mongodb").MongoClient;

// Set up cookies
var app = express();
app.use(cookieParser("$0ph13"));
app.use(cookieSession({
	name: "session",
	keys: ["$0ph13"],
	maxAge: 224 * 60 * 60 * 1000
}));

var db, usersColl, pollsColl, choicesColl;

mongo.connect("mongodb://localhost/voting-app", function(err, connection)
{
	db = connection;

	initalizeCollectionVariables(db);

	app.get("/", function(request, response)
	{
		// Send main page
		var template = fs.readFileSync("./ejs/MainPage.ejs", "utf-8");
		response.end(ejs.render(template, 
		{ 
			loggedIn: request.session.loggedIn,
			login: request.session.login
		 }));
	});
	
	app.get("/main.js", function(request, response)
	{
		fs.createReadStream("client/main.js", "utf-8").pipe(response);
	});
	app.get("/poll.js", function(request, response)
	{
		fs.createReadStream("client/poll.js", "utf-8").pipe(response);
	});
	app.get("/graph.js", function(request, response)
	{
		fs.createReadStream("client/graph.js", "utf-8").pipe(response);
	});
	
	app.get("/login", doLogin);
	app.get("/logout", doLogout);
	app.get("/createNewLogin", doCreateNewLogin);
	app.get("/loadPolls", doLoadPolls);
	app.get("/loadPollsForLogin", doLoadPollsForLogin);
	app.get("/showPoll", doShowPoll);
	app.get("/submitPollChoice", doSubmitPollChoice);
	app.get("/createNewPollChoice", doCreateNewPollChoice);
	app.get("/deletePoll", doDeletePoll);
	app.get("/getPollData", doGetPollData);
	app.get("/createNewPoll", doCreateNewPoll);
	
	app.listen(8080);
	console.log("Listening to port 8080");
});

function initalizeCollectionVariables(db)
{
	db.collection("users", function(err, collection)
	{
		usersColl = collection;
		db.collection("polls", function(err, collection)
		{
			pollsColl = collection;
			db.collection("choices", function(err, collection)
			{
				choicesColl = collection;
			});
		});
	});
}

function redirectToMainPage(response)
{
	// Resend main page through redirect
	response.setHeader("Location", "/");
	response.writeHead(302);
	response.end();
}

function doLogin(request, response)
{
	response.setHeader("Content-Type", "text/json");
	usersColl.findOne({ login: request.query.login }, function(err, item)
	{
		var out;
		if (!item || item.password != request.query.password)
		{
			out = { success: false };
		}
		else
		{
			out = { success: true };

			// Indicate that we're now logged in
			request.session.loggedIn = true;
			request.session.login = request.query.login;
		}
		response.end(JSON.stringify(out));
	});
}

function doLogout(request, response)
{
	// Clear session
	delete request.session.loggedIn;
	delete request.session.login;

	redirectToMainPage(response);
}

function doCreateNewLogin(request, response)
{
	response.setHeader("Content-Type", "text/json");

	usersColl.count({ login: request.query.login }, function(err, count)
	{
		var out;
		if (count == 1)
		{
			out = { success: false };
		}
		else
		{
			var obj = 
			{
				login: request.query.login, 
				password: request.query.password
			};
			usersColl.save(obj);
			out = { success: true };

			// Indicate that we're now logged in
			request.session.loggedIn = true;
			request.session.login = request.query.login;
		}
		response.end(JSON.stringify(out));
	});
}

function doLoadPolls(request, response)
{
	response.setHeader("Content-Type", "text/json");

	var polls = [];
	pollsColl.find(function(err, items)
	{
		items.each(function(err, item)
		{
			if (item)
				polls.push(item.name);
			else
			{
				var obj = { polls: polls };
				response.end(JSON.stringify(obj));
			}
		});
	});
}

function doLoadPollsForLogin(request, response)
{
	response.setHeader("Content-Type", "text/json");

	var login = decodeURIComponent(request.query.login);

	var polls = [];
	pollsColl.find({ creator_login: login }, function(err, items)
	{
		items.each(function(err, item)
		{
			if (item)
				polls.push(item.name);
			else
			{
				var obj = { polls: polls };
				response.end(JSON.stringify(obj));
			}
		});
	});
}

function doShowPoll(request, response)
{
    response.setHeader("Content-Type", "text/html");
	
	var pollName = decodeURIComponent(request.query.name);

	pollsColl.findOne({ name: pollName }, function(err, item)
	{
		var pollsId = item._id;
		var pollCreator = item.creator_login;

		var choices = [];
		choicesColl.find(function(err, items)
		{
			items.each(function(err, item)
			{
				if (item)
				{
					if (item.polls_id.toString() === pollsId.toString())
						choices.push(item.choice);
				}
				else
				{
					// Load Poll template
					var template = fs.readFileSync("./ejs/Poll.ejs", "utf-8");

					// Fill and send template
			   		response.end(ejs.render(template,
					{
						loggedIn: request.session.loggedIn,
			   	    	login: request.session.login,
						pollName: pollName,
						pollsId: pollsId,
						pollCreator: pollCreator,
						choices: choices
			        }));
				}
			});
		});

	});
}

function doSubmitPollChoice(request, response)
{
    response.setHeader("Content-Type", "text/html");

	var pollName = request.query["poll-name"];
	var pollsId = request.query["polls-id"];
	var choice = request.query["choice"];

	choicesColl.find(function(err, items)
	{
		items.each(function(err, item)
		{
			if (item)
			{
				if (item.polls_id.toString() === pollsId.toString() &&
					item.choice === choice)
				{
					item.votes++;
					choicesColl.save(item);
				}
			}
			else
			{
				// Load PollChoice template
				var template = fs.readFileSync("./ejs/PollChoice.ejs", "utf-8");

				// Fill and send template
		   		response.end(ejs.render(template,
				{
					loggedIn: request.session.loggedIn,
		   	    	login: request.session.login,
					pollName: pollName,
					choice: choice
		        }));
			}
		});
	});
	
}

function doCreateNewPollChoice(request, response)
{
    response.setHeader("Content-Type", "text/json");

	var pollsId = request.query["polls-id"];
	var choiceName = request.query["choice-name"];

	choicesColl.save( { polls_id: pollsId, choice: choiceName, votes: 0 }, 
		function(err)
	{
		var obj = { success: (err ? false : true) };
		response.end(JSON.stringify(obj));
	});

}

function doDeletePoll(request, response)
{
	response.header("Content-Type", "text/json");

	var pollName = decodeURIComponent(request.query["poll-name"]);

	pollsColl.findOne({ name: pollName }, function(err, item)
	{
		if (err || !item)
		{
			var obj = { success: false };
			response.end(JSON.stringify(obj));
			return;
		}

		var pollId = item._id;
		pollsColl.remove({ name: pollName });

		choicesColl.find(function(err, items)
		{
			items.each(function(err, item)
			{
				if (item)
				{
					if (item.polls_id.toString() == pollId.toString())
						choicesColl.remove({ _id: item._id })
				}
				else
				{
					var obj = { success: true };
					response.end(JSON.stringify(obj));
				}
			});
		});

	});
}

function doGetPollData(request, response)
{
	response.header("Content-Type", "text/json");

	var pollName = decodeURIComponent(request.query["poll-name"]);

	pollsColl.findOne({ name: pollName }, function(err, item)
	{
		if (err || !item)
		{
			var obj = { success: false };
			response.end(JSON.stringify(obj));
			return;
		}

		var obj = { success: true, data: [] };
		var pollId = item._id;
		choicesColl.find(function(err, items)
		{
			items.each(function(err, item)
			{
				if (item)
				{
					if (item.polls_id.toString() == pollId.toString())
						obj.data.push({ label: item.choice, 
							value: item.votes });
				}
				else
					response.end(JSON.stringify(obj));
			});
		});

	});
}

function doCreateNewPoll(request, response)
{
	response.header("Content-Type", "text/json");

	var pollOwner = decodeURIComponent(request.query["poll-owner"]);
	var pollName = decodeURIComponent(request.query["poll-name"]);
	var option1 = decodeURIComponent(request.query["option-1"]);
	var option2 = decodeURIComponent(request.query["option-2"]);

	pollsColl.save({ name: pollName, creator_login: pollOwner },
		function(err, item)
	{
        var key = item.ops[0]._id;
		choicesColl.save({ polls_id: key, choice: option1, votes: 0 },
			function()
			{
				choicesColl.save({ polls_id: key, choice: option2, votes: 0 },
					function()
					{
						response.end(JSON.stringify({ success: true }));
					});
			});
	});
}

