var net = require('net');

var zone = 2;

var client = net.connect(1099, function(){
	connectToServer();
});

function connectToServer() {
	var WebSocket = require('ws');
	var ws = new WebSocket('ws://example.com/websocket');
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
	});
	ws.on('message', function(data, flags) {
	    //console.log('Received: ' + data);
	    var jss = JSON.parse(data)[0];
	    console.log('Received Command: ' + jss[0]);
	    if (jss[0] == 'command') {
		    var js = jss[1].data;
		    console.log('Data: ' + JSON.stringify(js));
	    	if(js.eventType == 9 && js.zone == zone) {
	    		// Send X10 Event
		    	console.log('Sending Event');
		    	var house = String.fromCharCode(64+js.houseCode);
		    	var ncCommand = 'rf '+house+js.device+' '+commandFromInt(js.command)+'\n';
		      	console.log(ncCommand);
		      	client.write(ncCommand);
		   }
		} else if (jss[0] == 'command_collection') {
			var js = jss[1].data.events;
			var x = 0;
	    	for (var i = 0; i < js.length; i++) {
	    		setTimeout((function() {
	    			var device = js[x];
	    			console.log('Data: ' + JSON.stringify(device));
	    			if(device.eventType == 9 && device.zone == zone) {
			    		var house = String.fromCharCode(64+device.houseCode)
			    		var ncCommand = 'rf '+house+device.device+' '+commandFromInt(device.command)+'\n';
			    		console.log(ncCommand);
			    		client.write(ncCommand);
		    		}
		    		x++;
	    		}), 1000*i);
		    }
	    } else if (jss[0] == 'websocket_rails.ping') {
		    ws.send(JSON.stringify(['websocket_rails.pong', {'data': ''}]));
	    }
	});
}

function commandFromInt(command) {
	if(command == 0) {
  		return 'off';
  	} else if(command == 1) {
	  	return 'on';
	} else if(command == 2) {
		return 'dim';
	} else if(command == 3) {
		return 'bright';
	}
	return '';
}