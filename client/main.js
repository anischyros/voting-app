$(document).ready(function()
{
	loadPollList();
});

function loadPollListSuccess(json)
{
	var html = "";
	json.polls.forEach(function(pollName)
	{
		html += "<tr><td><a href='/showPoll?name=" + 
			encodeURIComponent(pollName) + "'>" +  pollName + "</a></td></tr>";
	});
	$("#poll-table").html(html);
}

function loadPollList()
{
	$.ajax("/loadPolls",
	{
		dataType: "json",
		success: loadPollListSuccess,
		error: function()
		{
			window.alert("Could not query database to load polls.  Refresh " +
				"the page later to try again.");
		}
	});
}

function loadPollListForLogin(login)
{
	$.ajax("/loadPollsForLogin",
	{
		data:
		{
			login: login
		},
		dataType: "json",
		success: loadPollListSuccess,
		error: function()
		{
			window.alert("Could not query database to load polls.  Refresh " +
				"the page later to try again.");
		}
	});
}

function doLogin()
{
	dialog = $("#login-form").dialog(
	{
		height: 400,
		width: 350,
		modal: true,
		buttons:
		{
			"Login": loginAccount
		}
	});
}

function loginAccountSuccess(json)
{
	if (json.success == true)
	{
		dialog.dialog("close");
		location.reload();
	}
	else
		window.alert("Login and/or password are incorrect.");
}

function loginAccount()
{
	$.ajax("/login",
	{
		data:
		{
			login: $("#login-field").val(),
			password: $("#password-field").val()
		},
		dataType: "json",
		success: loginAccountSuccess,
		error: function(err)
		{
			window.alert("Could not query database.  Try again later.");
		}
	});
}

function doCreateNewLogin()
{
	$("#new-login-form").dialog(
	{
		height: 400,
		width: 350,
		modal: true,
		buttons:
		{
			"Create account": createNewAccount
		}
	});
}

function createNewAccountSuccess(json)
{
	if (json.success == true)
		location.reload();
	else
		window.alert("This account already exists.");
}

function createNewAccount()
{
	$.ajax("/createNewLogin",
	{
		data:
		{
			login: $("#new-login-field").val(),
			password: $("#new-password-field").val()
		},
		dataType: "json",
		success: createNewAccountSuccess,
		error: function()
		{
			window.alert("Could not update database.  Try again later.");
		}
	});
}

var showAllPolls = true;

function onShowPollsButton(login)
{
	if (showAllPolls)
	{
		loadPollListForLogin(login);
		$("#show-polls-button").text("Show all polls");
	}
	else
	{
		loadPollList();
		$("#show-polls-button").text("Show only my polls");
	}
	showAllPolls = !showAllPolls;
}

function createNewPollSuccess(json)
{
	location.reload();
}

function createNewPoll()
{
	$.ajax("/createNewPoll",
	{
		data:
		{
			"poll-owner": $("#poll-owner-field").val(),
			"poll-name": $("#poll-name-field").val(),
			"option-1": $("#option-1-field").val(),
			"option-2": $("#option-2-field").val()
		},
		dataType: "json",
		success: createNewPollSuccess,
		error: function()
		{
			window.alert("Could not update database.  Try again later.");
		}
	});
}

function onCreateNewPollButton(login)
{
	$("#new-poll-form").dialog(
	{
		height: 300,
		width: 350,
		modal: true,
		buttons:
		{
			"Create": createNewPoll
		}
	});
}

