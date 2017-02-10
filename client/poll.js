function addNewChoice()
{
	var dialog = $("#add-choice-panel").dialog(
	{
		height: 150,
		width: 350,
		modal: true,
		buttons:
		{
			"Add new poll choice": createNewChoice,
			"Cancel": function()
			{
				dialog.dialog("close");
			}
		}
	});
}

function createNewChoiceSuccess(json)
{
	if (json.success)
		location.reload();
	else
		window.alert("Could not update database (error 2).  " +
			"Try again later.");
}

function createNewChoice()
{
	$.ajax("/createNewPollChoice",
	{
		data:
		{
			"polls-id": $("#polls-id-field").val(),
			"choice-name": $("#choice-name-field").val()
		},
		dataType: "json",
		success: createNewChoiceSuccess,
		error: function()
		{
			window.alert("Could not update database (error 1).  " +
				"Try again later.");
		}
	});
}

function deletePoll(pollName)
{
	var dialog = $("<div><p>Delete this poll?</p></div>").dialog(
	{
		height: 150,
		width: 350,
		modal: true,
		buttons:
		{
			"Delete": function()
			{
				$.ajax("/deletePoll",
				{
					data:
					{
						"poll-name": pollName
					},
					dataType: "json",
					success: deletePollSuccess,
					error: function()
					{
						window.alert("Could not update database.  Try again " +
							"later. (error 1)");
					}
				});
			},
			"Don't delete": function()
			{
				dialog.dialog("close");
			}
		}
	});
}

function deletePollSuccess(json)
{
	if (json.success == false)
	{
		window.alert("Could not update database.  Try again later. (error 2)");
		return;
	}

	window.alert("Poll successfully deleted");
	location.replace("/");
}

var graphInited = false;

function showGraphSuccess(json)
{
	if (!graphInited)
	{
		displayVotingResultsGraph(json);
		graphInited = true;
	}
	$("#graph").dialog(
	{
		width: 550,
		height: 400,
		modal: true
	});
}

function showGraph(pollName)
{
	$.ajax("/getPollData",
	{
		data:
		{
			"poll-name": pollName
		},
		dataType: "json",
		success: showGraphSuccess
	});
}

