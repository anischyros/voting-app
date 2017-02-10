var mongo = require("mongodb").MongoClient;

mongo.connect("mongodb://localhost/voting-app", function(err, db)
{
	db.dropCollection("users", function()
	{
		addLogins(db);
	});
	db.dropCollection("polls", function()
	{
		db.dropCollection("choices", function()
		{
			fetchCollections(db);
		});
	});
});

function addLogins(db)
{
	db.collection("users", function(err, collection)
	{
		collection.save({ login: "mendax", password: "12345" });
	});
}

function fetchCollections(db)
{
	db.collection("polls", function(err, collection)
	{
		var pollsColl = collection;
		db.collection("choices", function(err, collection)
		{
			var choicesColl = collection;
			loadPolls(db, pollsColl, choicesColl);
		});
	});
}

function loadPolls(db, pollsColl, choicesColl)
{
	polls.forEach(function(item)
	{
		loadPoll(db, pollsColl, choicesColl, item.name, item.choices);
	});
}

function loadPoll(db, pollsColl, choicesColl, name, choices)
{
	pollsColl.save({ name: name, creator_login: "mendax" },
		function(err, item)
	{
		var key = item.ops[0]._id;
		for (var i = 0; i < choices.length; i++)
			choicesColl.save({ polls_id: key, choice: choices[i], votes: 0 },
				function()
			{
				if (i >= choices.length)
					db.close();
			});
	});
}

var polls = [
{
	name: "Who is your favorite captain?",
	choices: [ "Picard", "Kirk", "Janeway", "Sisko", "Archer" ]
},
{
	name: "What is your favorite programming language?",
	choices: [ "Javascript", "Java", "C/C++", "Groovy" ]
}];
