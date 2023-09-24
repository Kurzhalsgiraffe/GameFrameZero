import json
import time

from database_access import Dao
from led_hardware import LEDMatrix

class Config:
    def __init__(self, config_file:str) -> None:
        self.config_file = config_file
        self.defaults = {
            "brightness": 1,
            "database_file": "database.sqlite",
            "default_animationtime": 200,
            "language": "de",
            "last_applied_image_id": 1,
            "power": "on",
            "skip_offset": 10,
            "speed": 1.0,
            "vacuum_on_start": False,
        }

    def read_config_file(self):
        """Read in the JSON config file"""
        with open(self.config_file, 'r', encoding="utf-8") as file:
            config = json.load(file)
        return config
    
    def write_config_file(self, config) -> None:
        """Write to the JSON config file"""
        with open(self.config_file, 'w+', encoding="utf-8") as file:
            json.dump(config, file, indent=4)

    def get_config(self, key:str):
        """Read the value to the key from the config file"""
        config = self.read_config_file()
        if key in config:
            return config[key]
        elif key in self.defaults:
            value = self.defaults[key]
            self.update_config(key, value)
            return value
        return None

    def update_config(self, key:str, value) -> None:
        """Write the key value pair the config file"""
        config = self.read_config_file()
        config[key] = value
        self.write_config_file(config)


class FrameManager:
    def __init__(self):
        self.config = Config('settings.json')
        self.database = Dao(self.config.get_config("database_file"))
        self.led = LEDMatrix(brightness=self.config.get_config("brightness"))
        self.default_animationtime = self.config.get_config("default_animationtime")
        self.animation_speed = self.config.get_config("speed")
        self.animation_running = False
        self.animation_stopped = True
        self.vacuum_database()

    def apply_color_array(self, color_array:list):
        """Apply the color_array to the LED-Matrix"""
        binary = self.color_array_to_binary(color_array)
        self.led.update_frame(binary)

    def apply_image_id(self, image_id:int) -> None:
        """Apply the image with the given image_id to the LED-Matrix"""
        binary = self.database.load_single_binary_by_id(image_id)
        self.led.update_frame(binary)
        self.config.update_config("last_applied_image_id", image_id)

    def load_animation_info_all(self) -> dict[str, list]:
        """Load informations of all animations"""
        data = {"animationIDs": [], "animationNames": [], "thumbnailIDs": []}

        info = self.database.load_animation_info_all()
        if info:
            for i in info:
                data["animationIDs"].append(i[0])
                data["animationNames"].append(i[1] if i[1] != "null" else "Animation " + str(i[0]))
            data["thumbnailIDs"] = self.database.get_all_animation_thumbnail_ids(data["animationIDs"])
        return data

    def load_single_image(self, image_id:int, pos:str) -> dict:
        """Load a single image. If pos is given, the image at the relative position from the current image_id will be loaded."""
        data = {"imageID": 0, "imageName": "", "colorArray": []}
        skip_offset = self.config.get_config("skip_offset")
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

        binary = self.database.load_single_binary_by_id(image_id)
        if binary:
            data["imageID"] = image_id
            data["imageName"] = self.database.get_image_name_by_id(image_id)
            data["colorArray"] = self.binary_to_color_array(binary)
        return data
    
    def get_image_name_by_id(self, image_id:int):
        """Get the image_name by image_id"""
        return self.database.get_image_name_by_id(image_id)

    def save_image(self, color_array:list, image_name:str) -> None:
        """Save the color_array to the database"""
        binary = self.color_array_to_binary(color_array)
        self.database.save_image(binary, image_name)

    def rename_image(self, image_id:int, image_name:str) -> None:
        """Rename the image"""
        self.database.rename_image_by_id(image_id, image_name)

    def rename_animation(self, animation_id:int, animation_name:str) -> None:
        """Rename the animation"""
        self.database.rename_animation_by_id(animation_id, animation_name)

    def replace_color_array(self, image_id:int, color_array:list):
        """Replace the existing image on the given image_id with the new color_array"""
        binary = self.color_array_to_binary(color_array)
        image_name = self.get_image_name_by_id(image_id)
        self.database.replace_binary_by_id(image_id, image_name, binary)

    def load_multiple_binaries_by_ids(self, image_ids:list) -> list:
        """Load the binaries of the given image_ids"""
        data = []
        if image_ids:
            binaries = self.database.load_multiple_binaries_by_ids(image_ids)
            for i in binaries:
                if i:
                    data.append((i[0], self.binary_to_color_array(bytearray(i[2]))))
                else:
                    data.append(None)
        return data

    def set_brightness(self, brightness:int) -> None:
        """Apply the brightness value"""
        if self.config.get_config("power") == "on":
            self.led.update_brightness(brightness)
        self.config.update_config("brightness", brightness)

    def set_power(self, power:str) -> None:
        """Apply the power settings"""
        if power == "on":
            brightness = int(self.config.get_config("brightness"))
            self.led.update_brightness(brightness)
        elif power == "off":
            self.led.update_brightness(0)
        self.config.update_config("power", power)

    def vacuum_database(self) -> None:
        """ perform a vacuum on the database if configured"""
        if self.config.get_config("vacuum_on_start"):
            self.database.vacuum()

# ---- ANIMATION ----

    def create_animation(self, name:str) -> None:
        self.database.create_animation(name)

    def add_animationframe(self, animation_id:int, image_id:int) -> None:
        """Add a frame to the animation"""
        last_pos = self.database.get_last_position_by_animation_id(animation_id)
        if last_pos:
            next_pos = last_pos + 1
        else:
            next_pos = 1
        self.database.add_image_to_animation(animation_id, image_id, next_pos, self.default_animationtime)

    def update_time_for_animationframe(self, animation_id:int, position:str, time:int) -> None:
        """Update the time for the animationframe at the given position"""
        if position == "all":
            self.database.update_animation_time_of_all_frames(animation_id, time)
        else:
            self.database.update_animation_time_of_single_frame(animation_id, position, time)

    def switch_animation_positions(self, animation_id:int, source_id:int, target_id:int) -> None:
        """Switch positions of images in the animation"""
        self.database.switch_animation_positions(animation_id, source_id, target_id)

    def delete_image(self, image_id:int) -> None:
        """Delete image by image_id"""
        self.database.delete_binary_by_id(image_id)

    def delete_animation(self, animation_id:int) -> None:
        """Delete animation by animation_id"""
        self.database.delete_animation(animation_id)
        self.database.remove_all_images_from_animation(animation_id)

    def remove_animation_frame(self, animation_id:int, position:int) -> None:
        """Remove the animation frame at the given position"""
        self.database.remove_image_from_animation(animation_id, position)
    
    def set_animation_speed(self, animation_speed:float) -> None:
        """Set the animation speed multiplicator"""
        self.animation_speed = animation_speed
        self.config.update_config("speed", self.animation_speed)

    def load_animation(self, animation_id:int) -> list:
        """Generate animationlist to loop through"""
        animationlist = []
        data = self.database.load_animation_info_single(animation_id)
        if data:
            binaries = self.database.load_multiple_binaries_by_ids(data["imageIDs"])

            for binary, sleep_time in zip(binaries, data["times"]):
                animationlist.append([binary[1], sleep_time/1000])
        return animationlist

    def start_animation(self, animation_id:int) -> None:
        """Start animation by id"""
        animationlist = self.load_animation(animation_id)
        if animationlist:
            self.animation_running = True
            self.animation_stopped = False

            while self.animation_running:
                for binary, sleep_time in animationlist:
                    if self.animation_running:
                        self.led.update_frame(binary)
                        time.sleep(sleep_time*(1/(self.animation_speed)))
            self.animation_stopped = True

    def stop_animation(self) -> None:
        """Stop the animation"""
        while not self.animation_stopped:
            self.animation_running = False

# ---- GENERAL METHODS ----

    def binary_to_color_array(self, binary:bytearray) -> list:
        """Transforms binary image to array of hexadecimal values"""
        color_array = []
        for i in range(0,768,3):
            color_array.append(f"#{(binary[i]*16**4+binary[i+1]*16**2+binary[i+2]):06x}")
        return color_array

    def color_array_to_binary(self, color_array:list) -> bytearray:
        """Transforms array of hexadecimal values to binary image"""
        binary = bytearray()
        for color in color_array:
            binary.append(int(color[1:3], 16))
            binary.append(int(color[3:5], 16))
            binary.append(int(color[5:7], 16))
        return binary
