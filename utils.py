def write_settings(key, value):
    settings = read_settings()
    settings[key] = value

    with open('settings.json', 'w', encoding="utf-8") as file:
        json.dump(settings, file)

def read_settings():
    with open('settings.json', 'r', encoding="utf-8") as file:
        settings = json.load(file)
    return settings

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
    for i in range(0,768,3):
        color_array.append(f"#{(binary[i]*16**4+binary[i+1]*16**2+binary[i+2]):06x}")
    return color_array

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