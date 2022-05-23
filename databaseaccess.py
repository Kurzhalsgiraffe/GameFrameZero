import sqlite3

class Dao:
    """
    This Class provides all the needed Methods to interact with the SQLite Database
    """
    def __init__(self, dbfile):
        try:
            self.conn = sqlite3.connect(dbfile, check_same_thread=False)
            self.cursor = self.conn.cursor()
            self.create_tables()
        except Exception as exception:
            print(exception)
            exit(-1)

    def create_tables(self):
        """
        This Method will create the Database Tables if they dont already exist
        """
        sql = """CREATE TABLE IF NOT EXISTS images (
            image_id integer PRIMARY KEY AUTOINCREMENT,
            image_data blob NOT NULL)"""
        self.cursor.execute(sql)

        sql = """CREATE TABLE IF NOT EXISTS animations (
            animation_id INTEGER PRIMARY KEY AUTOINCREMENT,
            animation_name TEXT NOT NULL)"""
        self.cursor.execute(sql)

        sql = """CREATE TABLE IF NOT EXISTS images_to_animations (
            animation_id INTEGER NOT NULL,
            image_id INTEGER NOT NULL,
            pos INTEGER NOT NULL,
            sleep_time INTEGER NOT NULL,
            PRIMARY KEY (animation_id, pos),
            FOREIGN KEY (animation_id) REFERENCES animations(animation_id),
            FOREIGN KEY (image_id) REFERENCES images(image_id))"""
        self.cursor.execute(sql)

    # -----  IMAGES TABLE  -----#

    def load_single_binary(self, image_id):
        """
        This Method will load a single image from the Database by image_id
        """
        try:
            sql = "SELECT * FROM images WHERE image_id=?"
            data = self.cursor.execute(sql,(image_id,)).fetchall()
            return bytearray(data[0][1])
        except Exception as exception:
            print(exception)
            return None

    def load_multiple_binarys(self, image_ids):
        """
        This Method will load multiple images from the Database by image_ids
        """
        try:
            arr = []
            for i in image_ids:
                sql = "SELECT * FROM images WHERE image_id = ?"
                data = self.cursor.execute(sql, (i,)).fetchone()
                if data:
                    arr.append(data)
                else:
                    arr.append(None)
            return arr
        except Exception as exception:
            print(exception)
            return None

    def save_binary(self, binary):
        """
        This Method will save an image to the Database
        """
        try:
            sql = "INSERT INTO images VALUES (NULL,?)"
            self.cursor.execute(sql, (binary,))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def delete_binary(self, image_id):
        """
        This Method will delete an image from the Database by image_id
        """
        try:
            sql = "DELETE FROM images WHERE image_id=?"
            self.cursor.execute(sql,(image_id,))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def get_first_image_id(self):
        """
        This Method will return the first image_id
        """
        try:
            sql = "SELECT MIN(image_id) FROM images"
            data = self.cursor.execute(sql).fetchone()
            return data[0]
        except Exception as exception:
            print(exception)
            return None

    def get_last_image_id(self):
        """
        This Method will return the last image_id
        """
        try:
            sql = "SELECT MAX(image_id) FROM images"
            data = self.cursor.execute(sql).fetchone()
            return data[0]
        except Exception as exception:
            print(exception)
            return None

    def get_next_image_id(self, current):
        """
        This Method will return the next image_id
        """
        try:
            if current >= self.get_last_image_id():
                return self.get_first_image_id()

            sql = "SELECT MIN(image_id) FROM images WHERE image_id > ?"
            data = self.cursor.execute(sql,(current,)).fetchone()
            return data[0]
        except Exception as exception:
            print(exception)
            return None

    def get_previous_image_id(self, current):
        """
        This Method will return the previous image_id
        """
        try:
            if current == self.get_first_image_id():
                return self.get_last_image_id()

            sql = "SELECT MAX(image_id) FROM images WHERE image_id < ?"
            data = self.cursor.execute(sql,(current,)).fetchone()
            return data[0]
        except Exception as exception:
            print(exception)
            return None

    def get_fbw_image_id(self, current, offset):
        """
        This Method will return the current - offset id (skip offset backwards)
        """
        try:
            if offset < 0:
                offset = 0
            elif offset == 0:
                return current

            sql = "SELECT image_id FROM images WHERE image_id > ?"
            data = self.cursor.execute(sql, (current,)).fetchall()
            data = [i[0] for i in data]
            if len(data) >= offset:
                return data[offset-1]
            return self.get_last_image_id()
        except Exception as exception:
            print(exception)
            return None

    def get_ffw_image_id(self, current, offset):
        """
        This Method will return the current + offset id (skip offset forwards)
        """
        try:
            if offset < 0:
                offset = 0
            elif offset == 0:
                return current

            sql = "SELECT image_id FROM images WHERE image_id < ?"
            data = self.cursor.execute(sql, (current,)).fetchall()
            data = [i[0] for i in data]
            if len(data) >= offset:
                return data[-offset]
            return self.get_first_image_id()
        except Exception as exception:
            print(exception)
            return None

    # -----  ANIMATIONS TABLE  -----#

    def create_animation(self, animation_name):
        """
        This Method will create a new animation
        """
        try:
            sql = "INSERT INTO animations VALUES (NULL,?)"
            self.cursor.execute(sql, (animation_name,))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def get_all_animations(self):
        """
        This Method will load all informations from the animations table
        """
        try:
            sql = "SELECT * FROM animations"
            data = self.cursor.execute(sql).fetchall()
            return data
        except Exception as exception:
            print(exception)
            return None

    def delete_animation(self, animation_id):
        """
        This Method will delete all rows with the animation_id
        """
        try:
            sql = "DELETE FROM animations WHERE animation_id=?"
            self.cursor.execute(sql, (animation_id,))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    # -----  IMAGES_TO_ANIMATIONS TABLE  -----#

    def add_image_to_animation(self, animation_id, image_id, position, time):
        """
        This Method will add a frame to the animation
        """
        try:
            sql = "INSERT INTO images_to_animations (animation_id, image_id, pos, sleep_time) VALUES (?,?,?,?)"
            self.cursor.execute(sql, (animation_id,image_id,position,time))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def remove_image_from_animation(self, animation_id, position):
        """
        This Method will first remove the row from the images_to_animations table,
        and then update all positions to restore the continuity
        """
        try:
            sql = "DELETE FROM images_to_animations WHERE animation_id=? AND pos=?"
            self.cursor.execute(sql, (animation_id,position))

            sql = "UPDATE images_to_animations SET pos = pos -1 WHERE animation_id=? AND pos>?"
            self.cursor.execute(sql, (animation_id,position))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def get_all_animation_thumbnail_ids(self, animation_ids):
        """
        This Method will load the first Frame ID of every Animation
        """
        try:
            sql = "SELECT * FROM images_to_animations"
            data = self.cursor.execute(sql).fetchall()
            data = sorted(data, key=lambda x: (x[0], x[2]))
            animation = []
            used = []
            ret = []
            for i in data:
                animation_id = i[0]
                if animation_id not in used:
                    used.append(animation_id)
                    animation.append(i)

            for i in animation_ids:
                for j in animation:
                    if j[0] == i:
                        ret.append(j[1])
                        break
                else:
                    ret.append(None)

            return ret
        except Exception as exception:
            print(exception)
            return None

    def remove_all_images_from_animation(self, animation_id):
        """
        This Methid will remove every row with this animation_id
        """
        try:
            sql = "DELETE FROM images_to_animations WHERE animation_id=?"
            self.cursor.execute(sql, (animation_id,))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def get_animation_by_id(self, animation_id):
        """
        This Method will load all informations of this animation
        """
        try:
            sql = "SELECT * FROM images_to_animations where animation_id = ? ORDER BY pos"
            data = self.cursor.execute(sql, (animation_id,)).fetchall()
            return data
        except Exception as exception:
            print(exception)
            return None

    def update_animation_time_of_single_frame(self, animation_id, position, time):
        """
        This Method will set the sleep_time of a single frame to time
        """
        try:
            sql = "UPDATE images_to_animations SET sleep_time=? WHERE animation_id=? AND pos=?"
            self.cursor.execute(sql, (time,animation_id,position))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def update_animation_time_of_all_frames(self, animation_id, time):
        """
        This Method will set the sleep_time of all animation frames to time
        """
        try:
            sql = "UPDATE images_to_animations SET sleep_time=? WHERE animation_id=?"
            self.cursor.execute(sql, (time,animation_id))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def switch_animation_positions(self, animation_id, source_id, target_id):
        """
        This Method will swap the image_id and sleep_time values
        of the animationframes with source_id and target_id
        """
        try:
            sql = "SELECT image_id, sleep_time FROM images_to_animations WHERE animation_id=? And pos=?"
            source_values = self.cursor.execute(sql, (animation_id,source_id)).fetchone()

            sql = "SELECT image_id, sleep_time FROM images_to_animations WHERE animation_id=? And pos=?"
            target_values = self.cursor.execute(sql, (animation_id,target_id)).fetchone()

            sql = "UPDATE images_to_animations SET image_id=?, sleep_time=? WHERE animation_id=? AND pos=?"
            self.cursor.execute(sql, (target_values[0],target_values[1],animation_id,source_id))

            sql = "UPDATE images_to_animations SET image_id=?, sleep_time=? WHERE animation_id=? AND pos=?"
            self.cursor.execute(sql, (source_values[0],source_values[1],animation_id,target_id))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def get_last_position_by_animation_id(self, animation_id):
        """
        This Method will return the highest position of all rows with this animation_id
        """
        try:
            sql = "SELECT MAX(pos) FROM images_to_animations WHERE animation_id=?"
            data = self.cursor.execute(sql, (animation_id,)).fetchone()
            return data[0]
        except Exception as exception:
            print(exception)
            return None
