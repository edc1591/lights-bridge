var SerialPort = require("serialport").SerialPort
var cronJob = require('cron').CronJob;

var zone = 1;
var scheduledEvents = new Array();

var WebSocket = require('ws');
var ws = new WebSocket('ws://lights.edc.me/websocket');

var serialPort = new SerialPort("/dev/ttyAMA0", {
  baudrate: 38400
});

serialPort.on("open", function () {
  console.log('serial port opened');
  connectToServer();
});

function connectToServer() {
	ws.on('error', function() {
	    console.log('error...retrying in 5 seconds...');
	    ws = null;
	    setTimeout((function() {
			connectToServer();
		}), 5000);
	});
	ws.on('close', function() {
	    console.log('disconnected...reconnecting...');
	    ws.terminate();
		ws = null;
		connectToServer();
	});
	ws.on('open', function() {
	    console.log('connected!');
	    // Get scheduled events
	    ws.send(JSON.stringify(['schedule_updated', {'data': {'zone': zone}}]));
	});
	ws.on('message', function(data, flags) {
	    //console.log('Received: ' + data);
	    var jss = JSON.parse(data)[0];
	    //console.log('Received Command: ' + jss[0]);
	    if (jss[0] == 'command') {
		    var js = jss[1].data;
		    console.log('Data: ' + JSON.stringify(js));
	    	handleEvent(js);
		} else if (jss[0] == 'command_collection') {
			var js = jss[1].data.events;
			var x = 0;
	    	for (var i = 0; i < js.length; i++) {
	    		setTimeout((function() {
	    			var device = js[x];
	    			console.log('Data: ' + JSON.stringify(device));
	    			handleEvent(device);
		    		x++;
	    		}), 1000*i);
		    }
	    } else if (jss[0] == 'websocket_rails.ping') {
		    ws.send(JSON.stringify(['websocket_rails.pong', {'data': ''}]));
	    } else if (jss[0] == 'schedule_updated') {
	    	console.log('updating schedule...');
	    	var events = jss[1].data.events;
	    	scheduleEvents(events);
	    }
	});
}

function handleEvent(dict) {
	//console.log('Handling: ' + JSON.stringify(dict));
	if (dict.zone = zone) {
		command = '';
		if (dict.eventType == 1) {
			console.log('sending solid color event');
			command = 'setcolor('+dict.color[0]+','+dict.color[1]+','+dict.color[2]+')\n';
		} else if (dict.eventType == 2 || dict.eventType == 3 || dict.eventType  == 6 || dict.eventType == 7) {
			console.log('sending animation event');
			command = 'animate('+dict.eventType+','+dict.brightness+','+dict.speed+')\n';
		} else if (dict.eventType == 9) {
			console.log('sending x10 event');
			command = 'x10command('+dict.device+','+dict.houseCode+','+dict.command+')\n';
		}
		console.log(command);
		serialPort.write(command);
	}
}

function scheduleEvents(events) {
	for(var i = 0; i < scheduledEvents.length; i++) {
    	scheduledEvents[i].stop();
	}
	scheduledEvents = new Array;

	for(var i = 0; i < events.length; i++) {
		events[i].state = shouldScheduleEvent(events[i]);
		
		if(events[i].state == true) {
		   	scheduleEvent(events[i]);
		} else {
        	console.log('not scheduling event');
	    }
	}
}

function scheduleEvent(event) {
    console.log('event scheduled');
    var date = new Date(event.time*1000);
    var cronString = date.getMinutes() + ' ' + date.getHours() + ' * * ' + event.repeat;

    if(event.repeat == '') {
    	//one-time
        var job = new cronJob(date, function(){
        		handleEvent(event);
	        	console.log('sending scheduled event');
	        	checkEvent(event);
	    	}, function () {
	    		//on-stop
	    		
	    	}, 
	    	true ,
		    event.timeZone
		);
		scheduledEvents.push(job);
    } else {
    	//repeating
        var job = new cronJob({
        	cronTime: cronString,
        	onTick: function() {
        		handleEvent(event);
	        	console.log('sending scheduled event');
	        	checkEvent(event);
        	},
        	start: true,
        	timeZone: event.timeZone
        });
        scheduledEvents.push(job);
    }
}

function checkEvent(event) {
	var newState = shouldScheduleEvent(event);
	if (newState != event.state) {
		ws.send(JSON.stringify(['toggle_event_state', {'data': {'id': event.scheduleId, 'event': event}}]));
	}
}

function shouldScheduleEvent(event) {
	//console.log('Should schedule?: ' + JSON.stringify(event));
	var now = Math.round(new Date().getTime() / 1000);
	if((now >= event.time && event.repeat == '') || event.state == false) {
		//console.log('no');
    	return false;
    }
    //console.log('yes');
    return true;
}