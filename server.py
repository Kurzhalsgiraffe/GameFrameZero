"""Flask Server: This is the main program"""
import frame_manager

from flask import Flask, request, jsonify, render_template, send_file
from waitress import serve

app = Flask(__name__)
manager = frame_manager.FrameManager()

## ----- RENDER HTML ----- ##

@app.route("/")
def index_page():
    return render_template("index.html")

@app.route("/images")
def images_page():
    return render_template("images.html")

@app.route("/animations")
def animations_page():
    return render_template("animations.html")

@app.route("/animation/editor")
def animation_editor_page():
    return render_template("animation_editor.html")

## ----- LOAD CONFIGURATION ----- ##

@app.route("/brightness/load")
def load_brightness():
    return str(manager.config.get_config("brightness"))

@app.route("/language/load")
def load_language():
    return str(manager.config.get_config("language"))

@app.route("/speed/load")
def load_speed():
    return str(manager.config.get_config("speed"))

@app.route("/power/load")
def load_power():
    return str(manager.config.get_config("power"))

@app.route("/animationtime/load")
def load_default_animationtime():
    return str(manager.config.get_config("default_animationtime"))

## ----- SET CONFIGURATION ----- ##

@app.route("/language/set", methods=["POST"])
def set_language():
    language = request.args.get('language', type = str)
    manager.config.update_config("language", language)
    return {}

@app.route("/brightness/set", methods=["POST"])
def set_brightness():
    brightness = request.args.get('brightness', type = int)
    manager.set_brightness(int(brightness))
    return {}

@app.route("/speed/set", methods=["POST"])
def set_speed():
    speed = request.args.get('speed', type = float)
    manager.set_animation_speed(float(speed))
    return {}

@app.route("/power/set", methods=["POST"])
def set_power():
    power = request.args.get('power', type = str)
    manager.set_power(power)
    return {}

## ----- IMAGE ROUTES ----- ##

@app.route("/image/load/single")
def image_load_single():
    current_image_id = request.args.get('image_id', type = int)
    pos = request.args.get('pos', type = str)
    data = manager.load_single_image(current_image_id, pos)
    return jsonify(data)

@app.route("/image/load/single/svg") # Replacing /image/load/single in the future
def image_load_single_svg():
    current_image_id = request.args.get('image_id', type = int)
    pos = request.args.get('pos', type = str)
    filepath, image_id, image_name = manager.load_single_image_svg(current_image_id, pos)
    if all([filepath, image_id, image_name]):
        return (
            send_file(filepath, mimetype='image/svg+xml'),
            200,
            {'image_id': image_id, 'image_name': image_name}
        )
    return {}, 400

@app.route("/image/load/multiple/svg", methods=["POST"])
def image_load_multiple():
    image_ids = request.json
    data = manager.load_multiple_image_svgs_by_ids(image_ids)
    return jsonify(data)

@app.route("/image/apply/colorarray", methods=["POST"])
def apply_color_array():
    color_array = request.json
    manager.apply_color_array(color_array)
    return {}

@app.route("/image/apply/id", methods=["POST"])
def apply_image_id():
    image_id = request.args.get('image_id', type = int)
    manager.apply_image_id(image_id)
    return {}

@app.route("/image/save", methods=["POST"])
def save_image():
    color_array = request.json
    image_name = request.args.get('image_name', type = str)
    manager.save_image(color_array, image_name)
    return {}

@app.route("/image/replace", methods=["POST"])
def replace_image():
    image_id = request.args.get('image_id', type = int)
    color_array = request.json
    if image_id and color_array:
        manager.replace_color_array(image_id, color_array)
        return {}
    return {},400

@app.route("/image/delete", methods=["DELETE"])
def delete_image():
    image_id = request.args.get('image_id', type = int)
    manager.delete_image(int(image_id))
    return {}

@app.route("/image/rename", methods=["POST"])
def rename_image():
    image_id = request.args.get('image_id', type = int)
    image_name = request.args.get('new_name', type = str)
    manager.rename_image(image_id, image_name)
    return {}

@app.route("/image/getname")
def get_image_name():
    image_id = request.args.get('image_id', type = int)
    image_name = manager.get_image_name_by_id(image_id)
    return image_name

@app.route('/image/upload', methods=['POST'])
def upload_file():
    uploaded_file = request.files['file']
    if uploaded_file:
        color_array = manager.process_uploaded_image(uploaded_file)
        return jsonify({"colorArray": color_array})
    return {}, 400

## ----- ANIMATION ----- ##

@app.route("/animation/info/load/single")
def load_animation_info_single():
    animation_id = request.args.get('animation_id', type = int)
    data = manager.database.load_animation_info_single(animation_id)
    return jsonify(data)

@app.route("/animation/info/load/all")
def load_animation_info_all():
    data = manager.load_animation_info_all()
    return jsonify(data)

@app.route("/animation/start", methods=["POST"])
def animation_start():
    animation_id = request.args.get('animation_id', type = int)
    manager.start_animation(animation_id)
    return {}

@app.route("/animation/stop", methods=["POST"])
def animation_stop():
    manager.stop_animation()
    return {}

@app.route("/animation/create", methods=["POST"])
def animation_create():
    name = request.args.get('name', type = str)
    manager.create_animation(name)
    return {}

@app.route("/animation/addframe", methods=["POST"])
def animation_frame_add():
    animation_id = request.args.get('animation_id', type = int)
    image_id = request.args.get('image_id', type = int)
    manager.add_animationframe(animation_id, image_id)
    return {}

@app.route("/animation/updatetime", methods=["POST"])
def animation_frame_updatetime():
    animation_id = request.args.get('animation_id', type = int)
    position = request.args.get('position', type = str)
    time = request.args.get('time', type = int)
    manager.update_time_for_animationframe(animation_id, position, time)
    return {}

@app.route("/animation/switchframepositions", methods=["POST"])
def animation_frame_switchpositions():
    animation_id = request.args.get('animation_id', type = int)
    source_id = request.args.get('source_id', type = int)
    target_id = request.args.get('target_id', type = int)
    manager.switch_animation_positions(animation_id, source_id, target_id)
    return {}

@app.route("/animation/delete", methods=["DELETE"])
def animation_delete():
    animation_id = request.args.get('animation_id', type = int)
    manager.delete_animation(animation_id)
    return {}

@app.route("/animation/rename", methods=["POST"])
def animation_rename():
    animation_id = request.args.get('animation_id', type = int)
    animation_name = request.args.get('new_name', type = str)
    manager.rename_animation(animation_id, animation_name)
    return {}

@app.route("/animation/removeframe", methods=["DELETE"])
def animation_frame_remove():
    animation_id = request.args.get('animation_id', type = int)
    position = request.args.get('pos', type = int)
    manager.remove_animation_frame(animation_id, position)
    return {}

## ----- MAIN ----- ##

if __name__ == "__main__":
    manager.restore_after_reboot()
    if __debug__:
        app.run(debug=True, host="0.0.0.0")
    else:
        serve(app, host="0.0.0.0", port=80)
