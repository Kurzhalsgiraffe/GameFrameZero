#Comment out Lines 2 75 92 159 163 for testing on Windows
import led
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

@app.route("/load/<id>/<pos>")
def load(id, pos):

    loadedFrameID = int(id)
    
    if pos == "first":
        loadedFrameID = database.getFirstID()
    elif pos == "prev":
        loadedFrameID = database.getPreviousID(loadedFrameID)
    elif pos == "next":
        loadedFrameID = database.getNextID(loadedFrameID)
    elif pos == "last":
        loadedFrameID = database.getLastID()

    try:
        b = database.loadBinaryFromDatabase(loadedFrameID)
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
    led.updateFrame(b)
    return {}

@app.route("/save", methods=["POST"])
def save():
    colorArray = request.json
    b = colorArrayToBinary(colorArray)
    try:
        database.saveBinaryToDatabase()
        return {}
    except:
        return {},400

@app.route("/brightness/apply/<br>", methods=["POST"])
def brightness_apply(br):
    global brightness
    brightness = br
    led.updateBrightness(int(brightness))
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
    frameID = int(id)
    try:
        database.deleteBinaryFromDatabase(frameID)
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

async def animationLoop():
    animation = []
    for frame,t in animationList:
        b = database.loadBinaryFromDatabase(int(frame))
        t = int(t)/1000
        animation.append([b,t])

    while animationRunning:
        for b,time in animation:
            if animationRunning:
                led.updateFrame(b)
                await asyncio.sleep(time)

if __name__ == "__main__":
    led.init()
    try:
        database = dao("database.sqlite")
    except:
        print("Failed to create Database connection")
        exit(-1)
    app.run(host="0.0.0.0")