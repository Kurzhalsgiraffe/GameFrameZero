import json
import time

from database_access import Dao
from led_hardware import LEDMatrix

STANDARD_ANIMATION_TIME = 200 # If changed, also change in JS!

class Animation:
    """ managing animations """
    def __init__(self, database, led):
        self.database = database
        self.led = led
        self.running = False
        self.stopped = True
        self.speed = read_settings("speed")

    def set_speed(self, speed):
        """ Set the percentage of the animation speed """
        speed = float(speed)
        self.speed = speed
        write_settings("speed", speed)

    def get_animationlist(self, animation_id):
        animationlist = []
        data = self.database.get_animationlist_by_id(animation_id)
        if data:
            binarys = self.database.load_multiple_binarys(data["imageIDs"])

            for binary, sleep_time in zip(binarys, data["times"]):
                animationlist.append([binary[1], sleep_time/1000])
        return animationlist

    def start_animation(self, animation_id):
        """ Start animation by id """
        animationlist = self.get_animationlist(animation_id)
        if animationlist:
            self.running = True
            self.stopped = False

            while self.running:
                for binary, sleep_time in animationlist:
                    if self.running:
                        self.led.update_frame(binary)
                        time.sleep(sleep_time*(1/(self.speed)))
            self.stopped = True

    def stop(self):
        """ Stop the animation """
        while self.stopped is False:
            self.running = False

class FrameManager:
    def __init__(self):
        self.database = Dao("database.sqlite")
        self.led = LEDMatrix(brightness=read_settings("brightness"))
        self.animation = Animation(self.database, self.led)

    def apply_color_array(self, color_array):
        binary = color_array_to_binary(color_array)
        self.led.update_frame(binary)

    def apply_image_id(self, image_id):
        binary = self.database.load_single_binary(image_id)
        self.led.update_frame(binary)
        write_settings("last_applied_image_id", image_id)

    def load_animation_info_all(self):
        animation_ids = []
        animation_names = []
        data = sorted(self.database.get_all_animations(), key=lambda x: x[0])
        if data:
            for i in data:
                animation_ids.append(i[0])
                if i[1]=="null":
                    animation_names.append("Animation "+str(i[0]))
                else:
                    animation_names.append(i[1])

            thumbnail_ids = self.database.get_all_animation_thumbnail_ids(animation_ids)

            data = {
                    "animationIDs": animation_ids,
                    "animationNames": animation_names,
                    "thumbnailIDs": thumbnail_ids
                }
            return data
        return None
    
    def load_single_frame(self, image_id, pos):
        skip_offset = read_settings("skip_offset")

        if pos:
            if pos == "first":
                image_id = self.database.get_first_image_id()
            elif pos == "fastbackwards":
                image_id = self.database.get_ffw_image_id(image_id, skip_offset)
            elif pos == "prev":
                image_id = self.database.get_previous_image_id(image_id)
            elif pos == "next":
                image_id = self.database.get_next_image_id(image_id)
            elif pos == "fastforwards":
                image_id = self.database.get_fbw_image_id(image_id, skip_offset)
            elif pos == "last":
                image_id = self.database.get_last_image_id()

        binary = self.database.load_single_binary(image_id)
        if binary:
            data = {
                "colorArray": binary_to_color_array(binary),
                "imageID": image_id
            }
            return data
        return None
    
    def save_color_array(self, color_array):
        binary = color_array_to_binary(color_array)
        self.database.save_binary(binary)

    def replace_color_array(self, image_id, color_array):
        binary = color_array_to_binary(color_array)
        self.database.replace_binary(image_id,binary)

    def load_multiple_binaries(self, image_ids):
        data = []
        if image_ids:
            binarys = self.database.load_multiple_binarys(image_ids)
            for i in binarys:
                if i:
                    data.append((i[0], binary_to_color_array(bytearray(i[1]))))
                else:
                    data.append(None)
        return data

    def apply_brightness(self, brightness):
        if read_settings("power") == "on":
            self.led.update_brightness(int(brightness))
        write_settings("brightness", int(brightness))

    def apply_power(self, power):
        if power == "on":
            brightness = int(read_settings("brightness"))
            self.led.update_brightness(brightness)
        elif power == "off":
            self.led.update_brightness(0)

        write_settings("power", power)

    def create_animation(self, name):
        self.database.create_animation(name)

    def add_animation_frame(self, animation_id, image_id):
        last_pos = self.database.get_last_position_by_animation_id(animation_id)
        if last_pos:
            next_pos = last_pos + 1
        else:
            next_pos = 1

        self.database.add_image_to_animation(animation_id, image_id, next_pos, STANDARD_ANIMATION_TIME)

    def update_time_for_animationframe(self, animation_id, position, time):
        if position == "all":
            self.database.update_animation_time_of_all_frames(animation_id, time)
        else:
            self.database.update_animation_time_of_single_frame(animation_id, position, time)

    def switch_animation_positions(self, animation_id, source_id, target_id):
        self.database.switch_animation_positions(animation_id, source_id, target_id)

    def delete_image(self, image_id):
        self.database.delete_binary(int(image_id))

    def delete_animation(self, animation_id):
        self.database.delete_animation(animation_id)
        self.database.remove_all_images_from_animation(animation_id)

    def remove_animation_frame(self, animation_id, position):
        self.database.remove_image_from_animation(animation_id, position)

    def vacuum_database(self):
        self.database.vacuum()

    def get_animationlist_by_id(self, animation_id):
        return self.database.get_animationlist_by_id(animation_id)









# FUNCTIONS

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
