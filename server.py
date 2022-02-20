import led
import socket
import json
import os
from flask import Flask, request, redirect, url_for, render_template

FRAME_SIZE = 768
frameID = 0

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/bilder")
def bilder():
    return render_template("bilder.html")

@app.route("/apply", methods=["POST"]) #POST Request to /apply
def apply():
    colorArray = request.json
    b = colorArrayToBinary(colorArray)
    led.updateFrame(b)
    return {}

@app.route("/save", methods=["POST"]) #POST Request to /save
def save():
    colorArray = request.json
    b = colorArrayToBinary(colorArray)
    with open('savedFrames', 'ab') as file:
        file.write(b)
    return {}

@app.route("/load/<pos>")
def load(pos):
    global frameID
    frameCount = os.path.getsize("savedFrames")//768
    if pos == "first":
        frameID = 0
    elif pos == "prev":
        print("prev")
        frameID = (frameID-1)%frameCount
    elif pos == "next":
        frameID = (frameID+1)%frameCount
    elif pos == "last":
        frameID = frameCount-1

    try:
        with open('savedFrames', 'rb') as file:
            file.seek(frameID*FRAME_SIZE,0)
            b = file.read(FRAME_SIZE)
            if len(b) == FRAME_SIZE:
                return json.dumps(binaryToColorArray(b))
        return {},400
    except:
        return {},400

def colorArrayToBinary(colorArray):
    b = bytearray()
    for c in colorArray:
        b.append(int(c[1:3], 16))
        b.append(int(c[3:5], 16))
        b.append(int(c[5:7], 16))
    return b

def binaryToColorArray(binary):
    c = []
    for i in range(0,768,3):
        c.append(f"#{(binary[i]*16**4+binary[i+1]*16**2+binary[i+2]):06x}")
    return c

if __name__ == "__main__":
    led.init()
    app.run(debug=True, host=socket.gethostname())