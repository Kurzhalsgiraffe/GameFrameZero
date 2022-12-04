"""Flask Server"""

import asyncio
from flask import Flask, request, jsonify, render_template
from waitress import serve
from databaseaccess import Dao
from led import LEDMatrix

FRAME_SIZE = 768
STANDARD_ANIMATION_TIME = 200
SKIP_OFFSET = 10

ANIMATION_RUNNING = False

app = Flask(__name__)
led = LEDMatrix()

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

@app.route("/animation/load/<animation_id>")
def animation_load(animation_id):
    try:
        data = load_animation_list_by_id(animation_id)
        if data:
            return jsonify(data)
    except Exception as exception:
        print(exception)
        return {},400

@app.route("/animation/load/all")
def animation_load_all():
    try:
        database = Dao("database.sqlite")

        data = sorted(database.get_all_animations(), key=lambda x: x[0])
        animation_ids = []
        animation_names = []
        if data:
            for i in data:
                animation_ids.append(i[0])
                if i[1]=="null":
                    animation_names.append("Animation "+str(i[0]))
                else:
                    animation_names.append(i[1])
            thumbnail_ids = database.get_all_animation_thumbnail_ids(animation_ids)

            data = {
                    "animationIDs": animation_ids,
                    "animationNames": animation_names,
                    "thumbnailIDs": thumbnail_ids
                }
            return jsonify(data)
    except Exception as exception:
        print(exception)
        return {},400

@app.route("/load/single")
def load_single():
    try:
        database = Dao("database.sqlite")

        image_id = request.args.get('image_id', type = int)
        pos = request.args.get('pos', type = str)
        if pos:
            if pos == "first":
                image_id = database.get_first_image_id()
            elif pos == "fastbackwards":
                image_id = database.get_ffw_image_id(image_id,SKIP_OFFSET)
            elif pos == "prev":
                image_id = database.get_previous_image_id(image_id)
            elif pos == "next":
                image_id = database.get_next_image_id(image_id)
            elif pos == "fastforwards":
                image_id = database.get_fbw_image_id(image_id,SKIP_OFFSET)
            elif pos == "last":
                image_id = database.get_last_image_id()

        binary = database.load_single_binary(image_id)
        if binary:
            data = {
                "colorArray": binary_to_color_array(binary),
                "imageID": image_id
            }
            return jsonify(data)
        return {}
    except Exception as exception:
        print(exception)
        return exception,400

@app.route("/brightness/load")
def brightness_load():
    return str(led.led_brightness)

## ----- POST ----- ##

@app.route("/apply", methods=["POST"])
def apply():
    try:
        database = Dao("database.sqlite")

        image_id = request.args.get('image_id', type = int)

        if image_id:
            binary = database.load_single_binary(image_id)
        else:
            color_array = request.json
            binary = color_array_to_binary(color_array)
        led.update_frame(binary)
        return {}
    except Exception as exception:
        print(exception)
        return exception,400

@app.route("/save", methods=["POST"])
def save():
    try:
        database = Dao("database.sqlite")

        color_array = request.json
        binary = color_array_to_binary(color_array)
        database.save_binary(binary)
        return {}
    except Exception as exception:
        print(exception)
        return {},400

@app.route("/replace", methods=["POST"])
def replace():
    try:
        database = Dao("database.sqlite")

        image_id = request.args.get('image_id', type = int)
        color_array = request.json
        binary = color_array_to_binary(color_array)

        if image_id:
            database.replace_binary(image_id,binary)
            return {}
        return {},400
    except Exception as exception:
        print(exception)
        return {},400

@app.route("/load/multiple", methods=["POST"])
def load_multiple():
    try:
        database = Dao("database.sqlite")

        image_ids = request.json
        if image_ids:
            binarys = database.load_multiple_binarys(image_ids)
            data = []
            for i in binarys:
                if i:
                    data.append((i[0], binary_to_color_array(bytearray(i[1]))))
                else:
                    data.append(None)
            return jsonify(data)
        return {}
    except Exception as exception:
        print(exception)
        return exception,400

@app.route("/brightness/apply/<brightness>", methods=["POST"])
def brightness_apply(brightness):
    led.update_brightness(int(brightness))
    return {}

@app.route("/animation/start/<animation_id>", methods=["POST"])
def animation_start(animation_id):
    global ANIMATION_RUNNING
    ANIMATION_RUNNING = True
    try:
        data = load_animation_list_by_id(animation_id)
        if data:
            image_ids = data["imageIDs"]
            times = data["times"]
            asyncio.set_event_loop(asyncio.new_event_loop())
            loop = asyncio.get_event_loop()
            loop.run_until_complete(animation_loop(image_ids, times))
            return {}
    except Exception as exception:
        print(exception)
        return exception

@app.route("/animation/stop", methods=["POST"])
def animation_stop():
    global ANIMATION_RUNNING
    ANIMATION_RUNNING = False
    return {}

@app.route("/animation/create/<name>", methods=["POST"])
def animation_create(name):
    try:
        database = Dao("database.sqlite")

        database.create_animation(name)
        return {}
    except Exception as exception:
        print(exception)
        return {},400

@app.route("/animation/frame/add/<animation_id>/<image_id>", methods=["POST"])
def animation_frame_add(animation_id, image_id):
    try:
        database = Dao("database.sqlite")

        last_pos = database.get_last_position_by_animation_id(animation_id)
        if last_pos:
            next_pos = last_pos + 1
        else:
            next_pos = 1

        database.add_image_to_animation(animation_id, image_id, next_pos, STANDARD_ANIMATION_TIME)
        return {}
    except Exception as exception:
        print(exception)
        return {},400

@app.route("/animation/frame/updatetime", methods=["POST"])
def animation_frame_updatetime():
    try:
        database = Dao("database.sqlite")

        animation_id = request.args.get('animation_id', type = int)
        position = request.args.get('position', type = str)
        time = request.args.get('time', type = int)

        if position == "all":
            database.update_animation_time_of_all_frames(animation_id, time)
        else:
            database.update_animation_time_of_single_frame(animation_id, position, time)
        return {}
    except Exception as exception:
        print(exception)
        return {},400

@app.route("/animation/frame/switchpositions", methods=["POST"])
def animation_frame_switchpositions():
    try:
        database = Dao("database.sqlite")

        animation_id = request.args.get('animation_id', type = int)
        source_id = request.args.get('source_id', type = int)
        target_id = request.args.get('target_id', type = int)

        database.switch_animation_positions(animation_id, source_id, target_id)
        return {}
    except Exception as exception:
        print(exception)
        return {},400

## ----- DELETE ----- ##

@app.route("/delete/<image_id>", methods=["DELETE"])
def delete(image_id):
    try:
        database = Dao("database.sqlite")

        database.delete_binary(int(image_id))
        return {}
    except Exception as exception:
        print(exception)
        return {},400

@app.route("/animation/delete/<animation_id>", methods=["DELETE"])
def animation_delete(animation_id):
    try:
        database = Dao("database.sqlite")

        database.delete_animation(animation_id)
        database.remove_all_images_from_animation(animation_id)
        return {}
    except Exception as exception:
        print(exception)
        return {},400

@app.route("/animation/frame/remove", methods=["DELETE"])
def animation_frame_remove():
    try:
        database = Dao("database.sqlite")

        animation_id = request.args.get('animation_id', type = int)
        position = request.args.get('pos', type = int)

        database.remove_image_from_animation(animation_id, position)
        return {}
    except Exception as exception:
        print(exception)
        return {},400

## ----- DISABLE CACHING ----- ##

@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

## ----- FUNCTIONS ----- ##

def color_array_to_binary(color_array):
    """
    Calculate bytearray from color_array
    """
    byte_array = bytearray()
    for color in color_array:
        byte_array.append(int(color[1:3], 16))
        byte_array.append(int(color[3:5], 16))
        byte_array.append(int(color[5:7], 16))
    return byte_array

def binary_to_color_array(binary):
    """
    Calculate color_array from bytearray
    """
    color_array = []
    for i in range(0,FRAME_SIZE,3):
        color_array.append(f"#{(binary[i]*16**4+binary[i+1]*16**2+binary[i+2]):06x}")
    return color_array

def load_animation_list_by_id(animation_id):
    """
    Load all informations of this animation
    """
    try:
        database = Dao("database.sqlite")

        animation_frames = database.get_animation_by_id(animation_id)
        data = {
                "imageIDs": [],
                "positions": [],
                "times": []
            }

        if animation_frames:
            for i in animation_frames:
                data["imageIDs"].append(i[1])
                data["positions"].append(i[2])
                data["times"].append(i[3])

            return data
    except Exception as exception:
        print(exception)
        return None

def startup_image(image_id):
    """
    Show image on startup
    """
    try:
        database = Dao("database.sqlite")

        binary = database.load_single_binary(image_id)
        led.update_frame(binary)
    except Exception as exception:
        print(exception)

async def animation_loop(image_ids, times):
    """
    Load all Animation details and Images, and loop them while ANIMATION_RUNNING == True
    """
    try:
        database = Dao("database.sqlite")

        animation_list = []
        binarys = database.load_multiple_binarys(image_ids)

        for binary, time in zip(binarys,times):
            animation_list.append([binary[1],time/1000])

        while ANIMATION_RUNNING:
            for binary,time in animation_list:
                if ANIMATION_RUNNING:
                    led.update_frame(binary)
                    await asyncio.sleep(time)
    except Exception as exception:
        print(exception)

if __name__ == "__main__":
    startup_image(1)
    if __debug__:
        app.run(debug=True, host="0.0.0.0")
    else:
        serve(app, host="0.0.0.0", port=80)
