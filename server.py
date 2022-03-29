#Comment out Lines 2 57 215 219 for testing on Windows
import led
import os
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
    loadedFrameID = updateLoadedFrameID(id, pos)
    try:
        b = loadBinaryFromFile(loadedFrameID)
        if len(b) == FRAME_SIZE:
            d = {
                "colorArray": binaryToColorArray(b),
                "frameID": loadedFrameID
            }
            return jsonify(d)
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
    newIndex = (getFrameCount()+1).to_bytes(COUNT_SIZE,"big")
    emptyIndex = getEmptySpaceIndex()  
    if emptyIndex:                                      # if there is a space marked as deleted...
        with open('savedFrames', 'r+b') as file:        # the frame will be written to the index and so the old image will be overwritten
            file.seek(emptyIndex,0)                     
            file.write(newIndex)                        # write the new index to before the inserted frame
            file.write(b)                               # write the frame
    else:                                                       # if there is no free space...
        with open('savedFrames', 'ab') as file:                 # the frame will be append to the end of the file
            file.write(newIndex)                                # write the new index to before the frame
            file.write(b)                                       # write the frame
    setFrameCount(getFrameCount()+1)
    return {}

@app.route("/addanimationframe/<id>", methods=["POST"])
def addanimationframe(id):
    global animationList
    animationList.append([id,STANDARD_ANIMATIONTIME])
    return {}

@app.route("/animationlist/update", methods=["POST"])
def updateanimationlist():
    global animationList
    animationList = request.json
    return {}

@app.route("/animationlist/apply", methods=["POST"])         #not implemented yet: start new thread and loop animationList
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
    loadedFrameID = int(id)
    i = 2
    with open('savedFrames', 'r+b') as file:
        while True:
            file.seek(i,0)
            binaryIndex = file.read(INDEX_SIZE)
            if binaryIndex == b'':
                break
            intIndex = int.from_bytes(binaryIndex, "big")    
            if intIndex == loadedFrameID:
                file.seek(i,0)
                file.write(b'\x00\x00')       # write the index to b'\x00\x00' (mark it as deleted)
                setFrameCount(getFrameCount()-1)
            elif intIndex > loadedFrameID:
                file.seek(i,0)
                file.write((intIndex-1).to_bytes(COUNT_SIZE,"big"))
            i+=(INDEX_SIZE+FRAME_SIZE)
    return {}

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

# read the count variable (First two Bytes of file)
def getFrameCount():
    with open('savedFrames', 'rb') as file:
        file.seek(0,0)
        return int.from_bytes(file.read(COUNT_SIZE), "big")

# set the count variable (First two Bytes of file) to parameter
def setFrameCount(c):
    with open('savedFrames', 'r+b') as file:
        file.seek(0,0)
        c = c.to_bytes(COUNT_SIZE,"big")
        file.write(c)

# iterate through all index values of file (2 bytes before each frame) and checks if they are marked as deleted (b'\x00\x00')
def getEmptySpaceIndex():
    with open('savedFrames', 'rb') as file:
        i = 2
        while True:
            file.seek(i,0)
            binaryIndex = file.read(INDEX_SIZE)
            if binaryIndex == b'':
                break
            elif binaryIndex == b'\x00\x00':
                return i
            i+=(INDEX_SIZE+FRAME_SIZE)
        return None

def loadBinaryFromFile(frameID):
    i = 2
    with open('savedFrames', 'rb') as file:
        while True:
            file.seek(i,0)
            binaryIndex = file.read(INDEX_SIZE)
            if binaryIndex == b'':
                break
            if int.from_bytes(binaryIndex, "big") == frameID:
                b = file.read(FRAME_SIZE)
                return b
            i+=(INDEX_SIZE+FRAME_SIZE)
    return None

def updateLoadedFrameID(id, pos):
    frameCount = getFrameCount()
    loadedFrameID = int(id)
    if frameCount < loadedFrameID:
        loadedFrameID = 1
    if pos == "first":
        loadedFrameID = 1
    elif pos == "prev":
        loadedFrameID = loadedFrameID - 1
        if loadedFrameID == 0:
            loadedFrameID = frameCount if frameCount > 0 else 1
    elif pos == "next":
        loadedFrameID = loadedFrameID + 1
        if loadedFrameID > frameCount:
            loadedFrameID = 1
    elif pos == "last":
        loadedFrameID = frameCount if frameCount > 0 else 1
    return loadedFrameID


async def animationLoop():
    animation = []
    for frame,t in animationList:
        b = loadBinaryFromFile(int(frame))
        t = int(t)/1000
        animation.append([b,t])

    while animationRunning:
        for b,time in animation:
            if animationRunning:
                led.updateFrame(b)
                await asyncio.sleep(time)

if __name__ == "__main__":
    led.init()
    if not os.path.exists("savedFrames"):
        with open('savedFrames', 'wb') as file:
            file.write(bytes(COUNT_SIZE))
    app.run(host="0.0.0.0")