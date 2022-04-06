#Comment out Lines 2 75 92 159 163 for testing on Windows
#import led
from turtle import pos
from databaseaccess import dao
import asyncio
from flask import Flask, request, jsonify, url_for, render_template

COUNT_SIZE = 2
INDEX_SIZE = 2
FRAME_SIZE = 768
STANDARD_ANIMATIONTIME = "200"

animationList = [["4","200"],["5","200"],["6","200"],["7","200"]] * 4  \
    + [["8","200"],["9","200"],["8","200"],["9","200"],["10","200"],["11","200"],["10","200"],["11","200"]]*3
animationRunning = False
brightness = 40

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

@app.route("/animation/edit")
def animation_edit():
    return render_template("animation_edit.html")

@app.route("/load")
def load():
    database = dao("database.sqlite")

    id = request.args.get('id', type = int)
    pos = request.args.get('pos', type = str)
    if pos:
        if pos == "first":
            id = database.getFirstID()
        elif pos == "prev":
            id = database.getPreviousID(id)
        elif pos == "next":
            id = database.getNextID(id)
        elif pos == "last":
            id = database.getLastID()

    try:
        b = database.loadBinaryFromDB(id)
        if b:
            d = {
                "colorArray": binaryToColorArray(b),
                "frameID": id
            }
            return jsonify(d)
        else:
            return {}
    except Exception as e:
        print(e)
        return e,400

@app.route("/brightness/load")
def brightness_load():
    return str(brightness)

@app.route("/animationlist/load")
def animationlist_load():
    return jsonify(animationList)

## ----- POST ----- ##

@app.route("/apply", methods=["POST"])
def apply():
    colorArray = request.json
    b = colorArrayToBinary(colorArray)
#    led.updateFrame(b)
    return {}

@app.route("/save", methods=["POST"])
def save():
    database = dao("database.sqlite")

    colorArray = request.json
    b = colorArrayToBinary(colorArray)
    try:
        database.saveBinaryToDB(b)
        return {}
    except Exception as e:
        print(e)
        return {},400

@app.route("/loadlist", methods=["POST"])
def loadlist():
    database = dao("database.sqlite")
    try:
        ids = request.json
        data = database.loadMultipleBinarysFromDB(ids)
        if data:
            d = [(i[0], binaryToColorArray(bytearray(i[1]))) for i in data]
            return jsonify(d)
        else:
            return {}
    except Exception as e:
        print(e)
        return e,400

@app.route("/brightness/apply/<br>", methods=["POST"])
def brightness_apply(br):
    global brightness
    brightness = br
#    led.updateBrightness(int(brightness))
    return {}
        
@app.route("/animationlist/add/<id>", methods=["POST"])
def animationlist_add(id):
    global animationList
    animationList.append([id,STANDARD_ANIMATIONTIME])
    return {}

@app.route("/animationlist/update", methods=["POST"])
def animationlist_update():
    global animationList
    animationList = request.json
    return {}

@app.route("/animation/apply", methods=["POST"])
def animation_apply():
    global animationRunning
    animationRunning = True
    asyncio.set_event_loop(asyncio.new_event_loop())
    loop = asyncio.get_event_loop()
    loop.run_until_complete(animationLoop())
    return {}

@app.route("/animation/stop", methods=["POST"])
def animation_stop():
    global animationRunning
    animationRunning = False
    return {}

## ----- DELETE ----- ##

@app.route("/delete/<id>", methods=["DELETE"])
def delete(id):
    database = dao("database.sqlite")
    frameID = int(id)
    try:
        database.deleteBinaryFromDB(frameID)
        return {}
    except Exception as e:
        print(e)
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

async def animationLoop():
    database = dao("database.sqlite")
    animation = []
    for frame,t in animationList:
        b = database.loadBinaryFromDB(int(frame))
        t = int(t)/1000
        animation.append([b,t])
    while animationRunning:
        for b,time in animation:
            if animationRunning:
#                led.updateFrame(b)
                await asyncio.sleep(time)

if __name__ == "__main__":
#    led.init()
    app.run(debug=True, host="0.0.0.0")