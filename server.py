"""Flask Server: This is the main program"""
import frame_manager

from flask import Flask, request, jsonify, render_template
from threading import Thread
from waitress import serve

app = Flask(__name__)
manager = frame_manager.FrameManager()

## ----- GET ----- ##

@app.route("/")
def index_page():
    """ Load index page """
    return render_template("index.html")

@app.route("/images")
def images_page():
    """ Load images page """
    return render_template("images.html")

@app.route("/animations")
def animations_page():
    """ Load animation page """
    return render_template("animations.html")

@app.route("/animation/editor")
def animation_editor_page():
    """ Load animation editor page """
    return render_template("animation_editor.html")

@app.route("/animation/load/<animation_id>")
def animation_load(animation_id):
    """ Load all informations of this animation """
    data = manager.get_animationlist_by_id(animation_id)
    return jsonify(data)

@app.route("/animation/load/all")
def animation_load_all():
    """ Load all animation_ids, animation_names and the image_id of their first image """
    data = manager.load_animation_info_all()
    return jsonify(data)

@app.route("/image/load/single")
def image_load_single():
    """  Calculate image_id based on current image_id and pos, and return image and new image_id """
    current_image_id = request.args.get('image_id', type = int)
    pos = request.args.get('pos', type = str)
    data = manager.load_single_frame(current_image_id, pos)
    return jsonify(data)

@app.route("/brightness/load")
def brightness_load():
    """ Load current LED brightness value """
    return str(frame_manager.read_settings("brightness"))

@app.route("/language/load")
def language_load():
    """ Load current language """
    return str(frame_manager.read_settings("language"))

@app.route("/speed/load")
def speed_load():
    """ Load current animation speed value """
    return str(frame_manager.read_settings("speed"))

@app.route("/power/load")
def power_load():
    """ Load current power status """
    return str(frame_manager.read_settings("power"))

## ----- POST ----- ##

@app.route("/image/apply_color_array", methods=["POST"])
def apply_color_array():
    """ Apply color array from json request to the frame """
    color_array = request.json
    manager.apply_color_array(color_array)
    return {}

@app.route("/image/apply_id", methods=["POST"])
def apply_id():
    """ Apply image by id to the frame """
    image_id = request.args.get('image_id', type = int)
    manager.apply_image_id(image_id)
    return {}

@app.route("/image/save", methods=["POST"])
def save():
    """ Save a new image """
    color_array = request.json
    manager.save_color_array(color_array)
    return {}

@app.route("/image/replace", methods=["POST"])
def replace():
    """ Replace an image by a new image """
    image_id = request.args.get('image_id', type = int)
    color_array = request.json
    if image_id and color_array:            # TODO: Dont know if its nessesary to check for color_array too
        manager.replace_color_array(image_id, color_array)
        return {}
    return {},400

@app.route("/image/load/multiple", methods=["POST"])
def image_load_multiple():
    """ Load multiple binarys by image_id """
    image_ids = request.json
    return jsonify(manager.load_multiple_binaries(image_ids))

@app.route("/brightness/apply/<brightness>", methods=["POST"])
def brightness_apply(brightness):
    """ Apply the brightness value to the LED strip """
    manager.apply_brightness(brightness)
    return {}

@app.route("/language/apply/<language>", methods=["POST"])
def language_apply(language):
    """ Apply language to the UI """
    frame_manager.write_settings("language", language)
    return {}

@app.route("/speed/apply/<speed>", methods=["POST"])
def speed_apply(speed):
    """ Apply a speed value to the animation """
    manager.animation.set_speed(float(speed))
    return {}

@app.route("/power/apply/<power>", methods=["POST"])
def power_apply(power):
    """ Apply power status to the LED-Matrix """
    manager.apply_power(power)
    return {}

@app.route("/animation/start/<animation_id>", methods=["POST"])
def animation_start(animation_id):
    """ Start a animation, stop the currently running if nessessary """
    manager.animation.stop()
    t = Thread(target=manager.animation.start_animation, args=(animation_id,))
    t.start()
    return {}

@app.route("/animation/stop", methods=["POST"])
def animation_stop():
    """ Stop the currently running animation """
    manager.animation.stop()
    return {}

@app.route("/animation/create/<name>", methods=["POST"])
def animation_create(name):
    """ Create a new animation """
    manager.create_animation(name)
    return {}

@app.route("/animation/frame/add/<animation_id>/<image_id>", methods=["POST"]) # TODO: add response stuff here
def animation_frame_add(animation_id, image_id):
    """ Add a frame to an animation """
    manager.add_animation_frame(animation_id, image_id)
    return {}

@app.route("/animation/frame/updatetime", methods=["POST"])
def animation_frame_updatetime():
    """ Update the sleep time of an animation frame """
    animation_id = request.args.get('animation_id', type = int)
    position = request.args.get('position', type = str)
    time = request.args.get('time', type = int)
    manager.update_time_for_animationframe(animation_id, position, time)
    return {}

@app.route("/animation/frame/switchpositions", methods=["POST"])
def animation_frame_switchpositions():
    """ switch positions of two images in an animation """
    animation_id = request.args.get('animation_id', type = int)
    source_id = request.args.get('source_id', type = int)
    target_id = request.args.get('target_id', type = int)
    manager.switch_animation_positions(animation_id, source_id, target_id)
    return {}

## ----- DELETE ----- ##

@app.route("/delete/<image_id>", methods=["DELETE"])  # TODO: RENAME
def delete(image_id):
    """ delete image by id"""
    manager.delete_image(image_id)
    return {}

@app.route("/animation/delete/<animation_id>", methods=["DELETE"])
def animation_delete(animation_id):
    """ delete animation and remove all images from the intermediate table """
    manager.delete_animation(animation_id)
    return {}

@app.route("/animation/frame/remove", methods=["DELETE"])
def animation_frame_remove():
    """ remove frame from animation """
    animation_id = request.args.get('animation_id', type = int)
    position = request.args.get('pos', type = int)
    manager.remove_animation_frame(animation_id, position)
    return {}

if __name__ == "__main__":
    last_applied_image_id = frame_manager.read_settings("last_applied_image_id")
    manager.apply_image_id(last_applied_image_id)

    if frame_manager.read_settings("auto vacuum") == True:
        manager.vacuum_database()

    if __debug__:
        app.run(debug=True, host="0.0.0.0")
    else:
        serve(app, host="0.0.0.0", port=80)
