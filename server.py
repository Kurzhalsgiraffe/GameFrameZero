#Comment out Lines 2 70 223 227 for testing on Windows
import led
import os
import sqlite3
import asyncio
from flask import Flask, request, jsonify, url_for, render_template

COUNT_SIZE = 2
INDEX_SIZE = 2
FRAME_SIZE = 768
STANDARD_ANIMATIONTIME = "200"

animationList = [["4","200"],["5","200"],["6","200"],["7","200"]] * 3 + [["4","300"]] \
    + [["8","200"],["9","200"],["8","200"],["9","200"],["10","200"],["11","200"],["10","200"],["11","200"]]*3
animationRunning = False

app = Flask(__name__)

## ----- GET ----- ##

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/images")
def images():
    return render_template("images.html")

@app.route("/animation")
def animation():
    return render_template("animation.html")

@app.route("/load/<id>/<pos>")
def load(id, pos):

    loadedFrameID = int(id)
    if pos == "first":
        loadedFrameID = getFirstID()
    elif pos == "prev":
        loadedFrameID = getPreviousID(loadedFrameID)
    elif pos == "next":
        loadedFrameID = getNextID(loadedFrameID)
    elif pos == "last":
        loadedFrameID = getLastID()

    try:
        b = loadBinaryFromDatabase(loadedFrameID)
        if b:
            if len(b) == FRAME_SIZE:
                d = {
                    "colorArray": binaryToColorArray(b),
                    "frameID": loadedFrameID
                }
                return jsonify(d)
        else:
            return {}
    except:
        return {},400

@app.route("/animationlist/load")
def loadanimationlist():
    return jsonify(animationList)

## ----- POST ----- ##

@app.route("/apply", methods=["POST"])
def apply():
    colorArray = request.json
    b = colorArrayToBinary(colorArray)
    led.updateFrame(b)
    return {}

@app.route("/save", methods=["POST"])
def save():
    colorArray = request.json
    b = colorArrayToBinary(colorArray)
    try:
        conn = db_connection()
        cursor = conn.cursor()
        cursor = cursor.execute("INSERT INTO images VALUES (NULL,?)", (b,))
        conn.commit()
        conn.close()
        return {}
    except:
        return {},400
        

@app.route("/animationlist/add/<id>", methods=["POST"])
def addanimationframe(id):
    global animationList
    animationList.append([id,STANDARD_ANIMATIONTIME])
    return {}

@app.route("/animationlist/update", methods=["POST"])
def updateanimationlist():
    global animationList
    animationList = request.json
    return {}

@app.route("/animationlist/apply", methods=["POST"])
def applyanimation():
    global animationRunning
    animationRunning = True
    asyncio.set_event_loop(asyncio.new_event_loop())
    loop = asyncio.get_event_loop()
    loop.run_until_complete(animationLoop())
    return {}

@app.route("/animationlist/stop", methods=["POST"])
def stopanimation():
    global animationRunning
    animationRunning = False
    return {}

## ----- DELETE ----- ##

@app.route("/delete/<id>", methods=["DELETE"])
def delete(id):
    frameID = int(id)
    try:
        conn = db_connection()
        cursor = conn.cursor()
        cursor = cursor.execute(" DELETE FROM images WHERE id=?",(frameID,))
        conn.commit()
        conn.close()
        return {}
    except:
        return {},400

## ----- FUNCTIONS ----- ##

def colorArrayToBinary(colorArray):
    b = bytearray()
    for c in colorArray:
        b.append(int(c[1:3], 16))
        b.append(int(c[3:5], 16))
        b.append(int(c[5:7], 16))
    return b

def binaryToColorArray(binary):
    c = []
    for i in range(0,FRAME_SIZE,3):
        c.append(f"#{(binary[i]*16**4+binary[i+1]*16**2+binary[i+2]):06x}")
    return c

def db_connection():
    conn = None
    try:
        conn = sqlite3.connect("database.sqlite")
    except:
        return None
    return conn

def loadBinaryFromDatabase(frameID):
    try:
        conn = db_connection()
        cursor = conn.cursor()
        cursor = cursor.execute(" SELECT * FROM images WHERE id=?",(frameID,))
        data = cursor.fetchall()
        conn.close()
        return bytearray(data[0][1])
    except:
        return None

def getFirstID():
    try:
        conn = db_connection()
        cursor = conn.cursor()
        cursor = cursor.execute("SELECT MIN(id) FROM images")
        data = cursor.fetchone()
        conn.close()
        return data[0]
    except:
        return None

def getLastID():
    try:
        conn = db_connection()
        cursor = conn.cursor()
        cursor = cursor.execute("SELECT id FROM images WHERE id = (SELECT MAX(id) FROM images)")
        data = cursor.fetchone()
        conn.close()
        return data[0]
    except:
        return None

def getNextID(current):
    try:
        if current == getLastID():
            return getFirstID()
        conn = db_connection()
        cursor = conn.cursor()
        cursor = cursor.execute("SELECT id FROM images WHERE id = (SELECT MIN(id) FROM images WHERE id > ?)",(current,))
        data = cursor.fetchone()
        conn.close()
        return data[0]
    except:
        return None

def getPreviousID(current):
    try:
        if current == getFirstID():
            return getLastID()
        conn = db_connection()
        cursor = conn.cursor()
        cursor = cursor.execute("SELECT id FROM images WHERE id = (SELECT MAX(id) FROM images WHERE id < ?)",(current,))
        data = cursor.fetchone()
        conn.close()
        return data[0]
    except:
        return None

async def animationLoop():
    animation = []
    for frame,t in animationList:
        b = loadBinaryFromDatabase(int(frame))
        t = int(t)/1000
        animation.append([b,t])

    while animationRunning:
        for b,time in animation:
            if animationRunning:
                led.updateFrame(b)
                await asyncio.sleep(time)

if __name__ == "__main__":
    led.init()
    if not os.path.exists("database.sqlite"):
        conn = db_connection()
        cursor = conn.cursor()
        sql = """ CREATE TABLE images (
            id integer PRIMARY KEY AUTOINCREMENT,
            img blob NOT NULL)"""
        cursor.execute(sql)
    app.run(host="0.0.0.0")