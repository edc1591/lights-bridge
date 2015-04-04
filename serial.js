var SerialPort = require("serialport").SerialPort;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({
  extended: true
})); 

var serialPort = new SerialPort("/dev/ttyAMA0", {
  baudrate: 38400
});

serialPort.on("open", function () {
  app.post('/arduino/power', function (req, res) {
    console.log('Sending Event');
    command = req.param('value') == 'true' ? 'animate(2,255,199)' : 'setcolor(0,0,0)';
    console.log(command);
    serialPort.write(command + '\n');
    res.send('OK');
  });

  app.post('/arduino/brightness', function (req, res) {
    // console.log('Sending Event');
    // command = req.param('value') == 'true' ? 'animate(2,255,199)' : 'setcolor(0,0,0)';
    // console.log(command);
    // serialPort.write(command + '\n');
    res.send('OK');
  });

  app.post('/arduino/hue', function (req, res) {
    // console.log('Sending Event');
    // command = req.param('value') == 'true' ? 'animate(2,255,199)' : 'setcolor(0,0,0)';
    // console.log(command);
    // serialPort.write(command + '\n');
    res.send('OK');
  });

  var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Lights bridge listening at http://%s:%s', host, port);

  });
});