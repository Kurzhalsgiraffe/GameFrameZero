"""Flask Server"""

import time
from flask import Flask, request, jsonify, render_template
from waitress import serve
from utils import read_settings, write_settings, color_array_to_binary, binary_to_color_array
from databaseaccess import Dao
from led import LEDMatrix

STANDARD_ANIMATION_TIME = 200 # If changed, also change in JS!

class Animation:
    """
    This Class provides all the needed Methods to do animations
    """
    def __init__(self):
        self.running = False
        self.stopped = True
        self.speed = read_settings("speed")

    def set_speed(self, speed):
        """
        Set the percentage of the animation speed
        """
        speed = float(speed)
        self.speed = speed
        write_settings("speed",speed)

    def stop(self):
        """
        Stop the animation
        """
        while self.stopped is False:
            self.running = False

    def start(self,animation_id):
        """
        Start the animation
        """
        self.stop()
        self.animation_loop(animation_id)

    def animation_loop(self,animation_id):
        """
        Load all Animation details and images, and loop them
        """
        animation_list = []
        data = load_animation_list_by_id(animation_id)
        if data:
            self.running = True
            self.stopped = False

            binarys = database.load_multiple_binarys(data["imageIDs"])

            for binary, sleep_time in zip(binarys, data["times"]):
                animation_list.append([binary[1], sleep_time/1000])

            while self.running:
                for binary, sleep_time in animation_list:
                    if self.running:
                        led.update_frame(binary)
                        time.sleep(sleep_time*(1/(self.speed)))
            self.stopped = True

app = Flask(__name__)
led = LEDMatrix()
animation = Animation()
database = Dao("database.sqlite")

## ----- GET ----- ##

@app.route("/")
def index_page():
    """
    Load index page"""
    return render_template("index.html")

@app.route("/images")
def images_page():
    """
    Load images page
    """
    return render_template("images.html")

@app.route("/animations")
def animations_page():
    """
    Load animation page
    """
    return render_template("animations.html")

@app.route("/animation/editor")
def animation_editor_page():
    """
    Load animation editor page
    """
    return render_template("animation_editor.html")

@app.route("/animation/load/<animation_id>")
def animation_load(animation_id):
    """
    Load all informations of this animation
    """
    data = load_animation_list_by_id(animation_id)
    if data:
        return jsonify(data)
    return {},400

@app.route("/animation/load/all")
def animation_load_all():
    """
    Load all animation_ids, animation_names and the image_id of their first image
    """
    animation_ids = []
    animation_names = []
    data = sorted(database.get_all_animations(), key=lambda x: x[0])
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
    return {},400

@app.route("/load/single")
def load_single():
    """
    Calculate image_id based on current image_id and pos, and return image and new image_id
    """
    image_id = request.args.get('image_id', type = int)
    pos = request.args.get('pos', type = str)

    skip_offset = read_settings("skip_offset")

    if pos:
        if pos == "first":
            image_id = database.get_first_image_id()
        elif pos == "fastbackwards":
            image_id = database.get_ffw_image_id(image_id,skip_offset)
        elif pos == "prev":
            image_id = database.get_previous_image_id(image_id)
        elif pos == "next":
            image_id = database.get_next_image_id(image_id)
        elif pos == "fastforwards":
            image_id = database.get_fbw_image_id(image_id,skip_offset)
        elif pos == "last":
            image_id = database.get_last_image_id()

    binary = database.load_single_binary(image_id)
    if binary:
        data = {
            "colorArray": binary_to_color_array(binary),
            "imageID": image_id
        }
        return jsonify(data)
    return {},400

@app.route("/brightness/load")
def brightness_load():
    """
    Load current LED brightness value
    """
    return str(led.led_brightness)

@app.route("/language/load")
def language_load():
    """
    Load current language
    """
    return str(read_settings("language"))

@app.route("/speed/load")
def speed_load():
    """
    Load current animation speed value
    """
    return str(animation.speed)

## ----- POST ----- ##

@app.route("/apply", methods=["POST"])
def apply():
    """
    Apply an image to the frame.
    """
    image_id = request.args.get('image_id', type = int)

    if image_id:
        binary = database.load_single_binary(image_id)
    else:
        color_array = request.json
        binary = color_array_to_binary(color_array)
    led.update_frame(binary)
    return {}

@app.route("/save", methods=["POST"])
def save():
    """
    Save a new image to the database
    """
    color_array = request.json
    binary = color_array_to_binary(color_array)
    database.save_binary(binary)
    return {}

@app.route("/replace", methods=["POST"])
def replace():
    """
    Replace an image by a new image
    """
    image_id = request.args.get('image_id', type = int)

    color_array = request.json
    binary = color_array_to_binary(color_array)

    if image_id:
        database.replace_binary(image_id,binary)
        return {}
    return {},400

@app.route("/load/multiple", methods=["POST"])
def load_multiple():
    """
    Load multiple binarys by image_id
    """
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
    return {},400

@app.route("/brightness/apply/<brightness>", methods=["POST"])
def brightness_apply(brightness):
    """
    Apply the brightness value to the LED strip
    """
    led.update_brightness(int(brightness))
    write_settings("brightness",brightness)
    return {}

@app.route("/language/apply/<language>", methods=["POST"])
def language_apply(language):
    """
    Apply language
    """
    write_settings("language",language)
    return {}

@app.route("/speed/apply/<speed>", methods=["POST"])
def speed_apply(speed):
    """
    Apply a speed value to the animation
    """
    animation.set_speed(float(speed))
    return {}

@app.route("/animation/start/<animation_id>", methods=["POST"])
def animation_start(animation_id):
    """
    Start a animation, stop the currently running if nessessary
    """
    animation.start(animation_id)
    return {}

@app.route("/animation/stop", methods=["POST"])
def animation_stop():
    """
    Stop the currently running animation
    """
    animation.stop()
    return {}

@app.route("/animation/create/<name>", methods=["POST"])
def animation_create(name):
    """
    Create a new animation
    """
    database.create_animation(name)
    return {}

@app.route("/animation/frame/add/<animation_id>/<image_id>", methods=["POST"])
def animation_frame_add(animation_id, image_id):
    """
    Add a frame to an animation
    """
    last_pos = database.get_last_position_by_animation_id(animation_id)
    if last_pos:
        next_pos = last_pos + 1
    else:
        next_pos = 1

    database.add_image_to_animation(animation_id, image_id, next_pos, STANDARD_ANIMATION_TIME)
    return {}

@app.route("/animation/frame/updatetime", methods=["POST"])
def animation_frame_updatetime():
    """
    Update the sleep time of an animation frame
    """
    animation_id = request.args.get('animation_id', type = int)
    position = request.args.get('position', type = str)
    sleep_time = request.args.get('time', type = int)

    if position == "all":
        database.update_animation_time_of_all_frames(animation_id, sleep_time)
    else:
        database.update_animation_time_of_single_frame(animation_id, position, sleep_time)
    return {}

@app.route("/animation/frame/switchpositions", methods=["POST"])
def animation_frame_switchpositions():
    """
    Switch positions of two images in an animation
    """
    animation_id = request.args.get('animation_id', type = int)
    source_id = request.args.get('source_id', type = int)
    target_id = request.args.get('target_id', type = int)

    database.switch_animation_positions(animation_id, source_id, target_id)
    return {}

## ----- DELETE ----- ##

@app.route("/delete/<image_id>", methods=["DELETE"])
def delete(image_id):
    """
    Delete image from database
    """
    database.delete_binary(int(image_id))
    return {}

@app.route("/animation/delete/<animation_id>", methods=["DELETE"])
def animation_delete(animation_id):
    """
    Delete animation and remove all images from the intermediate table
    """
    database.delete_animation(animation_id)
    database.remove_all_images_from_animation(animation_id)
    return {}

@app.route("/animation/frame/remove", methods=["DELETE"])
def animation_frame_remove():
    """
    Remove frame from animation
    """
    animation_id = request.args.get('animation_id', type = int)
    position = request.args.get('pos', type = int)

    database.remove_image_from_animation(animation_id, position)
    return {}

## ----- FUNCTIONS ----- ##

def load_animation_list_by_id(animation_id):
    """
    Load all informations of this animation
    """
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

def startup_image(image_id):
    """
    Show image on startup
    """
    binary = database.load_single_binary(image_id)
    led.update_frame(binary)

if __name__ == "__main__":
    database.vacuum()
    startup_image(1)

    if __debug__:
        app.run(debug=True, host="0.0.0.0")
    else:
        serve(app, host="0.0.0.0", port=80)
