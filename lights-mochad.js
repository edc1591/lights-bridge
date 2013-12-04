var net = require('net');

var client = net.connect(1099, function(){
	var WebSocket = require('ws');
	var ws = new WebSocket('ws://example.com/websocket');
	ws.on('message', function(data, flags) {
	    //console.log('Received: ' + data);
	    var jss = JSON.parse(data)[0];
	    console.log('Received Command: ' + jss[0]);
	    if (jss[0] == 'command') {
		    var js = jss[1].data;
		    console.log('Data: ' + js);
	    	if(js.event == 9) {
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
		    		var house = String.fromCharCode(64+device.houseCode)
		    		var ncCommand = 'rf '+house+device.device+' '+commandFromInt(device.command)+'\n';
		    		console.log(ncCommand);
		    		client.write(ncCommand);
		    		x++;
	    		}), 1000*i);
		    }
	    } else if (jss[0] == 'websocket_rails.ping') {
		    ws.send(JSON.stringify(['websocket_rails.pong', {'data': ''}]));
	    }
	});
});

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