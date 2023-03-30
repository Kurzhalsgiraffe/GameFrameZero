import json

def write_settings(key, value):
    """
    Write the key value pair the settings file
    """
    with open('settings.json', 'r', encoding="utf-8") as file:
        settings = json.load(file)
        settings[key] = value

    with open('settings.json', 'w', encoding="utf-8") as file:
        json.dump(settings, file)

def read_settings(key):
    """
    Read the value to the key from the settings file
    """
    with open('settings.json', 'r', encoding="utf-8") as file:
        settings = json.load(file)
    if key in settings:
        return settings[key]
    return None

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
