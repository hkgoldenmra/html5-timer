var showHours = true;
var showMilliseconds = true;
var fields = window.location.href.split('?');
fields = fields[1].split('&');
for (var i in fields){
	var params = fields[i].split('=');
	if (params[0] == 'showh'){
		showHours = params[1] == 1;
	} else if (params[0] == 'showms'){
		showMilliseconds = params[1] == 1;
	}
}

var timerId = null;
var frames = 0;
var checkpointIndex = 0;

function loadCheckpoint(jsonString){
	var error = document.getElementById('error');
	error.innerHTML = '';
	var table = document.getElementById('checkpointTable');
	var tbody = table.getElementsByTagName('tbody');
	tbody = tbody[0];
	while (tbody.rows.length > 0){
		tbody.deleteRow(0);
	}
	try{
		var checkpoints = document.getElementById('data').value.split("\n");
		for (var i in checkpoints){
			var checkpoint = checkpoints[i].split(',', 5);
			var tr = tbody.insertRow(-1);
			tr.id = 'currentTimer' + i;
//
			var td = tr.insertCell(-1);
			td.align = 'right';
			var title = checkpoint[4];
			if (title == undefined){
				td.innerHTML = i;
			} else {
				td.innerHTML = title;
			}
//
			td = tr.insertCell(-1);
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
//
			td = tr.insertCell(-1);
			td.align = 'right';
			td.id = 'currentTime' + i;
//
			td = tr.insertCell(-1);
			td.align = 'right';
			td.id = 'comparedTime' + i;
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
	checkpointIndex = 0;
}

function updateStatus(){
	if (timerId != null){
		try{
			var checkpoints = document.getElementById('data').value.split("\n");
			frames++;
//
			var currentMilliseconds = Math.floor(frames * 1000 / 60);
			var currentSeconds = Math.floor(currentMilliseconds / 1000);
			var currentMinutes = Math.floor(currentSeconds / 60);
			var currentHours = Math.floor(currentMinutes / 24);
			var originalMilliseconds = currentMilliseconds;
//
			currentMilliseconds %= 1000;
			currentSeconds %= 60;
			currentMinutes %= 60;
//		currentHours %= 24;
//
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
//
			for (var i in checkpoints){
				var element = document.getElementById('currentTimer' + i);
				element.style.backgroundColor = '#000000';
				if (i == checkpointIndex){
					element.style.backgroundColor = '#666666';
				}
			}
			for (var i = checkpointIndex; i < checkpoints.length; i++){
				var checkpoint = checkpoints[i].split(',', 5);
				var milliseconds = parseInt(checkpoint[3]);
				if (milliseconds == undefined || isNaN(milliseconds)){
					milliseconds = 0;
				}
				var seconds = parseInt(checkpoint[2]);
				if (seconds == undefined || isNaN(seconds)){
					seconds = 0;
				}
				var minutes = parseInt(checkpoint[1]);
				if (minutes == undefined || isNaN(minutes)){
					minutes = 0;
				}
				var hours = parseInt(checkpoint[0]);
				if (hours == undefined || isNaN(hours)){
					hours = 0;
				}
				var targetMilliseconds = milliseconds;
				targetMilliseconds += seconds * 1000;
				targetMilliseconds += minutes * 60 * 1000;
				targetMilliseconds += hours * 60 * 60 * 1000;
//
				var comparedMilliseconds = targetMilliseconds - originalMilliseconds;
				var isNegative = comparedMilliseconds < 0;
				comparedMilliseconds = Math.abs(comparedMilliseconds);
				var comparedHours = Math.floor(comparedMilliseconds / 3600000);
				comparedMilliseconds %= 3600000;
				var comparedMinutes = Math.floor(comparedMilliseconds / 60000);
				comparedMilliseconds %= 60000;
				var comparedseconds = Math.floor(comparedMilliseconds / 1000);
				comparedMilliseconds %= 1000;
//
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
//
				document.getElementById('currentTime' + i).innerHTML = currentString;
				document.getElementById('comparedTime' + i).innerHTML = (isNegative ? '+' : '-') + comparedString;
			}
			window.requestAnimationFrame(updateStatus);
		} catch (ex){
			error.innerHTML = ex.toString();
		}
	}
}

function submitCheckpointOnBody(event){
	if (event.keyCode == 27){
		submitCheckpoint();
	}
}

function submitCheckpoint(){
	var checkpoints = document.getElementById('data').value.split("\n");
	if (checkpointIndex < checkpoints.length){
		checkpointIndex++;
	} else {
		startOrPauseTimer();
	}
}
