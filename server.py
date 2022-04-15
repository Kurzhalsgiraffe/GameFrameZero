#Comment out Lines 2 106 146 258 264 for testing on Windows
import led
from databaseaccess import dao
import asyncio
from flask import Flask, request, jsonify, url_for, render_template

FRAME_SIZE = 768

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

@app.route("/animation/editor")
def animation_editor():
    return render_template("animation_editor.html")

@app.route("/animation/load/<id>")
def animation_load(id):
    try:
        d = loadAnimationListByID(id)
        return jsonify(d)
    except Exception as e:
        print(e)
        return {},400

@app.route("/animation/load/all")
def animation_load_all():
    database = dao("database.sqlite")
    try:
        data = sorted(database.getAllAnimations(), key=lambda x: x[0])
        animation_ids = []
        animation_names = []
        for i in data:
            animation_ids.append(i[0])
            if i[1]=="null":
                animation_names.append("Animation "+str(i[0]))
            else:
                animation_names.append(i[1])
        thumbnail_ids = database.getAllAnimationThumbnails(animation_ids)
        
        d = {
                "animationIDs": animation_ids,
                "animationNames": animation_names,
                "thumbnailIDs": thumbnail_ids
            }
        return jsonify(d)
    except Exception as e:
        print(e)
        return {},400

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
        b = database.loadSingleBinary(id)
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

## ----- POST ----- ##

@app.route("/apply", methods=["POST"])
def apply():
    colorArray = request.json
    b = colorArrayToBinary(colorArray)
    led.updateFrame(b)
    return {}

@app.route("/save", methods=["POST"])
def save():
    database = dao("database.sqlite")

    colorArray = request.json
    b = colorArrayToBinary(colorArray)
    try:
        database.saveBinary(b)
        return {}
    except Exception as e:
        print(e)
        return {},400

@app.route("/loadlist", methods=["POST"])
def loadlist():
    database = dao("database.sqlite")
    try:
        ids = request.json
        if ids:
            data = database.loadMultipleBinarys(ids)
            d = []
            for i in data:
                if i:
                    d.append((i[0],binaryToColorArray(bytearray(i[1]))))
                else:
                    d.append(None)
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
    led.updateBrightness(int(brightness))
    return {}

@app.route("/animation/start/<id>", methods=["POST"])
def animation_start(id):
    global animationRunning
    animationRunning = True
    d = loadAnimationListByID(id)
    asyncio.set_event_loop(asyncio.new_event_loop())
    loop = asyncio.get_event_loop()
    loop.run_until_complete(animationLoop(d))
    return {}

@app.route("/animation/stop", methods=["POST"])
def animation_stop():
    global animationRunning
    animationRunning = False
    return {}

@app.route("/animation/create/<name>", methods=["POST"])
def animation_create(name):
    database = dao("database.sqlite")
    try:
        database.createAnimation(name)
        return {}
    except Exception as e:
        print(e)
        return {},400

@app.route("/animation/edit", methods=["POST"])
def animation_edit():
    try:
        pass
    except Exception as e:
        print(e)
        return {},400


## ----- DELETE ----- ##

@app.route("/delete/<id>", methods=["DELETE"])
def delete(id):
    database = dao("database.sqlite")
    frameID = int(id)
    try:
        database.deleteBinary(frameID)
        return {}
    except Exception as e:
        print(e)
        return {},400

@app.route("/animation/delete/<id>", methods=["DELETE"])
def animation_delete(id):
    database = dao("database.sqlite")
    try:
        pass
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

def loadAnimationListByID(id):
    try:
        database = dao("database.sqlite")
        data = database.getAnimationByID(id)
        image_ids = []
        positions = []
        times = []
        for i in data:
            image_ids.append(i[1])
            positions.append(i[2])
            times.append(i[3])
        d = {
                "imageIDs": image_ids,
                "positions": positions,
                "times": times
            }
        return d
    except Exception as e:
        print(e)

async def animationLoop(d):
    try:
        database = dao("database.sqlite")
        animation = []
        blobs = database.loadMultipleBinarys(d["imageIDs"])
        times = d["times"]
        for i in range(len(d["imageIDs"])):
            b = blobs[i]
            if b:
                b = b[1]
                t = times[i]/1000
                animation.append([b,t])
        while animationRunning:
            for b,time in animation:
                if animationRunning:
                    led.updateFrame(b)
                    await asyncio.sleep(time)
    except Exception as e:
        print(e)

if __name__ == "__main__":
    led.init()
    app.run(host="0.0.0.0")