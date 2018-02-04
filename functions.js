var showHours = true;
var showMilliseconds = true;
var fields = window.location.href.split('?');
if (fields.length > 1){
	fields = fields[1].split('&');
	for (var i in fields){
		var params = fields[i].split('=');
		if (params[0] == 'showh'){
			showHours = (params[1] == 1);
		} else if (params[0] == 'showms'){
			showMilliseconds = (params[1] == 1);
		}
	}
}

var timerId = null;
var frames = 0;

function loadCheckpoint(){
	var error = document.getElementById('error');
	error.innerHTML = '';
	var table = document.getElementById('checkpointTable');
	var tbody = table.getElementsByTagName('tbody');
	tbody = tbody[0];
	while (tbody.rows.length > 0){
		tbody.deleteRow(0);
	}
	var resultTable = document.getElementById('resultTable');
	var resultTbody = resultTable.getElementsByTagName('tbody');
	resultTbody = resultTbody[0];
	while (resultTbody.rows.length > 0){
		resultTbody.deleteRow(0);
	}
	try{
		var data = document.getElementById('data').value;
		if (data.trim().length > 0){
			var checkpoints = data.trim().split("\n");
			for (var i in checkpoints){
				checkpoints[i] = checkpoints[i].trim();
				var checkpoint = checkpoints[i].split(/[, 	]/, 4);
				checkpoint.push(checkpoints[i].replace(/^([^, 	]*[, 	]){4}/, ''));
				var tr = tbody.insertRow(-1);
				tr.id = 'checkpoint' + i;

				var td = tr.insertCell(-1);
				td.align = 'right';
				var title = checkpoint[4];
				if (title == undefined){
					td.innerHTML = i;
				} else {
					td.innerHTML = title;
				}

				td = tr.insertCell(-1);
				td.id = 'targetTime' + i;
				td.align = 'right';
				var seconds = parseInt(checkpoint[2]);
				if (seconds == undefined || isNaN(seconds)){
					seconds = 0;
				}
				var minutes = parseInt(checkpoint[1]);
				if (minutes == undefined || isNaN(minutes)){
					minutes = 0;
				}
				var secondString = padZero(seconds, 2);
				var minuteString = padZero(minutes, 2);
				var string = minuteString + ':' + secondString;
				if (showHours){
					var hours = parseInt(checkpoint[0]);
					if (hours == undefined || isNaN(hours)){
						hours = 0;
					}
					var hourString = padZero(hours, 2);
					string = hourString + ':' + string;
				}
				if (showMilliseconds){
					var milliseconds = parseInt(checkpoint[3]);
					if (milliseconds == undefined || isNaN(milliseconds)){
						milliseconds = 0;
					}
					var millisecondString = padZero(milliseconds, 3);
					string += '.' + millisecondString;
				}
				td.innerHTML = string;

				td = tr.insertCell(-1);
				td.align = 'right';
				td.id = 'comparedTime' + i;

				td = tr.insertCell(-1);
				td.align = 'right';
				td.id = 'currentTime' + i;
			}
		}
	} catch (ex){
		error.innerHTML = ex.toString();
	}
}

function padZero(value, length){
	value = '' + value;
	while (value.length < length){
		value = '0' + value;
	}
	return value;
}

function startOrPauseTimer(){
	var start = document.getElementById('start');
	if (start.value == 'Start'){
		start.value = 'Pause';
		timerId = window.requestAnimationFrame(updateStatus);
	} else {
		start.value = 'Start';
		timerId = null;
	}
}

function resetTimer(){
	var string = '00:00';
	if (showHours){
		string = '00:' + string;
	}
	if (showMilliseconds){
		string += '.000';
	}
	document.getElementById('timerString').innerHTML = string;
	frames = 0;
	loadCheckpoint();
}

function updateStatus(){
	if (timerId != null){
		try{
			frames++;

			var currentMilliseconds = Math.floor(frames / 60 * 1000);
			var currentSeconds = Math.floor(currentMilliseconds / 1000);
			var currentMinutes = Math.floor(currentSeconds / 60);
			var currentHours = Math.floor(currentMinutes / 60);
			var originalMilliseconds = currentMilliseconds;

			currentMilliseconds %= 1000;
			currentSeconds %= 60;
			currentMinutes %= 60;

			var currentSecondString = padZero(currentSeconds, 2);
			var currentMinuteString = padZero(currentMinutes, 2);
			var currentString = currentMinuteString + ':' + currentSecondString;
			if (showHours){
				var currentHourString = padZero(currentHours, 2);
				currentString = currentHourString + ':' + currentString;
			}
			if (showMilliseconds){
				var currentMillisecondString = padZero(currentMilliseconds, 3);
				currentString += '.' + currentMillisecondString;
			}
			document.getElementById('timerString').innerHTML = currentString;

			var table = document.getElementById('checkpointTable');
			var tbody = table.getElementsByTagName('tbody');
			var trs = tbody[0].rows;
			for (var i = 0; i < trs.length; i++){
				var targetMilliseconds = 0;
				var tr = trs[i];
				var id = tr.id.replace('checkpoint', '');
				var targetTime = document.getElementById('targetTime' + id).innerHTML;
				if (showHours && showMilliseconds){
					var field1 = targetTime.split('.');
					var field0 = field1[0].split(':');
					targetMilliseconds += parseInt(field0[0]) * 3600000;
					targetMilliseconds += parseInt(field0[1]) * 60000;
					targetMilliseconds += parseInt(field0[2]) * 1000;
					targetMilliseconds += parseInt(field1[1]);
				} else if (showHours){
					var field0 = targetTime.split(':');
					targetMilliseconds += parseInt(field0[0]) * 3600000;
					targetMilliseconds += parseInt(field0[1]) * 60000;
					targetMilliseconds += parseInt(field0[2]) * 1000;
				} else if (showMilliseconds){
					var field1 = targetTime.split('.');
					var field0 = field1[0].split(':');
					targetMilliseconds += parseInt(field0[0]) * 60000;
					targetMilliseconds += parseInt(field0[1]) * 1000;
					targetMilliseconds += parseInt(field1[1]);
				} else {
					var field0 = field1[0].split(':');
					targetMilliseconds += parseInt(field0[0]) * 60000;
					targetMilliseconds += parseInt(field0[1]) * 1000;
				}
				var comparedMilliseconds = targetMilliseconds - originalMilliseconds;
				var isNegative = comparedMilliseconds < 0;
				comparedMilliseconds = Math.abs(comparedMilliseconds);
				var comparedHours = Math.floor(comparedMilliseconds / 3600000);
				comparedMilliseconds %= 3600000;
				var comparedMinutes = Math.floor(comparedMilliseconds / 60000);
				comparedMilliseconds %= 60000;
				var comparedseconds = Math.floor(comparedMilliseconds / 1000);
				comparedMilliseconds %= 1000;

				var comparedSecondString = padZero(comparedseconds, 2);
				var comparedMinuteString = padZero(comparedMinutes, 2);
				var comparedString = comparedMinuteString + ':' + comparedSecondString;
				if (showHours){
					var comparedHourString = padZero(comparedHours, 2);
					comparedString = comparedHourString + ':' + comparedString;
				}
				if (showMilliseconds){
					var comparedMillisecondString = padZero(comparedMilliseconds, 3);
					comparedString += '.' + comparedMillisecondString;
				}

				document.getElementById('comparedTime' + id).innerHTML = (isNegative ? '+' : '-') + comparedString;
				document.getElementById('currentTime' + id).innerHTML = currentString;
			}
			window.requestAnimationFrame(updateStatus);
		} catch (ex){
			error.innerHTML = ex.lineNumber + ': ' + ex.toString();
		}
	}
}

function submitCheckpointOnBody(event){
	if (event.keyCode == 27){
		submitCheckpoint();
	}
}

function submitCheckpoint(){
	var table = document.getElementById('checkpointTable');
	var tbody = table.getElementsByTagName('tbody');
	tbody = tbody[0];
	var resultTable = document.getElementById('resultTable');
	var resultTbody = resultTable.getElementsByTagName('tbody');
	resultTbody = resultTbody[0];
	if (tbody.rows.length > 0){
		var tr = tbody.rows[0].cloneNode(true);
		var tds = tr.getElementsByTagName('td');
		for (var i in tds){
			tds[i].id = null;
		}
		resultTbody.appendChild(tr);
		tbody.deleteRow(0);
	} else {
		startOrPauseTimer();
	}
}
