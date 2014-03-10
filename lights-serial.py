#!/usr/bin/env python

import serial
import websocket
import thread
import time
import sys
import json

PORT = '/dev/ttyAMA0'
BAUD = 38400
zone = 1

ser = serial.Serial(PORT, BAUD)

def on_close(ws):
	print('Closed Socket, reopening')
	open_socket()

def on_message(ws, message):
	print(message)
	j = json.loads(message)
	obj = j[0]
	sentCommand = obj[0]
	print(sentCommand)
	if sentCommand == "websocket_rails.ping":
		print('pong')
		ws.send(json.dumps(['websocket_rails.pong', {'data': ''}]))
	elif sentCommand == "command":
		if obj[1]['data']['zone_id'] == zone:
			handle_event(obj[1]['data'])
	elif sentCommand == "command_collection":
		for action in obj[1]['data']['events']:
			if action['zone_id'] == zone:
				handle_event(action)
				time.sleep(1.5)

def on_error(ws, error):
    print(error)
    
def on_open(ws):
    print("Opened...")

def handle_event(data):
	event = data['eventType']
	ser.write(chr(13))
	if event == 1:
		ser.write('setcolor('+str(data['color'][0])+','+str(data['color'][1])+','+str(data['color'][2])+')')
	elif event == 2 or event == 3 or event == 6 or event == 7:
		ser.write('animate('+str(event)+','+str(data['brightness'])+','+str(data['speed'])+')')
	elif event == 9:
		ser.write('x10command('+str(data['device'])+','+str(data['houseCode'])+','+str(data['command'])+')')
	ser.write(chr(13))
	time.sleep(0.02)
	
def open_socket():
	websocket.enableTrace(True)
	host = "ws://example.com/websocket?zone_id="+str(zone)
	ws = websocket.WebSocketApp(host,
								on_message = on_message,
								on_error = on_error,
								on_close = on_close)
	ws.on_open = on_open
	ws.run_forever()
    
if __name__ == "__main__":
    open_socket()