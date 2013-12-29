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
	print('Closed Socket')
	ser.close()

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
		handle_event(obj[1]['data'])

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
    
if __name__ == "__main__":
    websocket.enableTrace(True)
    if len(sys.argv) < 2:
        host = "ws://lights.edc.me/websocket"
    else:
        host = sys.argv[1]
    ws = websocket.WebSocketApp(host,
                                on_message = on_message,
                                on_error = on_error,
                                on_close = on_close)
    ws.on_open = on_open
    ws.run_forever()