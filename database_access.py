"""SQLite Database"""

import sqlite3
import traceback

class Dao:
    """
    This Class provides all the needed Methods to interact with the SQLite Database
    """
    def __init__(self, dbfile):
        try:
            sqlite3.threadsafety = 1
            self.dbfile = dbfile
            self.create_tables()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def get_db_connection(self):
        """
        This Method opens a db connection
        """
        try:
            conn = sqlite3.connect(self.dbfile, check_same_thread=False)
            cursor = conn.cursor()
            return conn, cursor

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def vacuum(self):
        """
        This Method performs a Vacuum on the Database
        """
        try:
            conn, cursor = self.get_db_connection()
            sql = """VACUUM"""
            cursor.execute(sql)
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def create_tables(self):
        """
        This Method will create the Database Tables if they dont already exist
        """
        try:
            conn, cursor = self.get_db_connection()

            sql = """CREATE TABLE IF NOT EXISTS images (
                image_id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_name TEXT NOT NULL,
                image_data BLOB NOT NULL
                )"""
            cursor.execute(sql)

            sql = """CREATE TABLE IF NOT EXISTS animations (
                animation_id INTEGER PRIMARY KEY AUTOINCREMENT,
                animation_name TEXT NOT NULL
                )"""
            cursor.execute(sql)

            sql = """CREATE TABLE IF NOT EXISTS images_to_animations (
                animation_id INTEGER NOT NULL,
                image_id INTEGER NOT NULL,
                pos INTEGER NOT NULL,
                sleep_time INTEGER NOT NULL,
                PRIMARY KEY (animation_id, pos),
                FOREIGN KEY (animation_id) REFERENCES animations(animation_id),
                FOREIGN KEY (image_id) REFERENCES images(image_id)
                )"""
            cursor.execute(sql)
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    # -----  IMAGES TABLE  -----#

    def load_single_binary_by_id(self, image_id):
        """
        This Method will load a single image from the Database by image_id
        """
        try:
            conn, cursor = self.get_db_connection()

            sql = "SELECT * FROM images WHERE image_id=?"
            data = cursor.execute(sql,(image_id,)).fetchall()
            conn.close()
            return bytearray(data[0][2])

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
            return None

    def load_multiple_binaries_by_ids(self, image_ids):
        """
        This Method will load multiple images from the Database by image_ids
        """
        try:
            conn, cursor = self.get_db_connection()

            arr = []
            sql = f"SELECT * FROM images WHERE image_id IN ({','.join('?'*len(image_ids))})"
            data = cursor.execute(sql, image_ids).fetchall()

            for image_id in image_ids:
                for d in data:
                    if d[0] == image_id:
                        arr.append(d)
                        break
                else:
                    arr.append(None)
            conn.close()
            return arr

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
            return None

    def save_image(self, binary, image_name):
        """
        This Method will save an image to the Database
        """
        try:
            conn, cursor = self.get_db_connection()

            sql = "INSERT INTO images VALUES (NULL,?,?)"
            cursor.execute(sql, (image_name, binary))
            conn.commit()
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def replace_binary_by_id(self, image_id, image_name, binary):
        """
        This Method will replace an image in the Database
        """
        try:
            conn, cursor = self.get_db_connection()

            self.delete_binary_by_id(image_id)
            sql = "INSERT INTO images VALUES (?,?,?)"
            cursor.execute(sql, (image_id, image_name, binary))
            conn.commit()
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def delete_binary_by_id(self, image_id):
        """
        This Method will delete an image from the Database by image_id
        """
        try:
            conn, cursor = self.get_db_connection()

            sql = "DELETE FROM images WHERE image_id=?"
            cursor.execute(sql,(image_id,))
            conn.commit()
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def get_image_name_by_id(self, image_id):
        """
        This Method will return the name of the image with image_id
        """
        try:
            conn, cursor = self.get_db_connection()

            sql = "SELECT image_name FROM images WHERE image_id=?"
            data = cursor.execute(sql,(image_id,)).fetchone()
            conn.close()
            return data[0]

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
            return None

    def get_first_image_id(self):
        """
        This Method will return the first image_id
        """
        try:
            conn, cursor = self.get_db_connection()

            sql = "SELECT MIN(image_id) FROM images"
            data = cursor.execute(sql).fetchone()
            conn.close()
            return data[0]

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
            return None

    def get_last_image_id(self):
        """
        This Method will return the last image_id
        """
        try:
            conn, cursor = self.get_db_connection()

            sql = "SELECT MAX(image_id) FROM images"
            data = cursor.execute(sql).fetchone()
            conn.close()
            return data[0]

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
            return None

    def get_next_image_id(self, current):
        """
        This Method will return the next image_id
        """
        try:
            conn, cursor = self.get_db_connection()

            if current >= self.get_last_image_id():
                return self.get_first_image_id()

            sql = "SELECT MIN(image_id) FROM images WHERE image_id > ?"
            data = cursor.execute(sql,(current,)).fetchone()
            conn.close()
            return data[0]

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
            return None

    def get_previous_image_id(self, current):
        """
        This Method will return the previous image_id
        """
        try:
            conn, cursor = self.get_db_connection()

            if current == self.get_first_image_id():
                return self.get_last_image_id()

            sql = "SELECT MAX(image_id) FROM images WHERE image_id < ?"
            data = cursor.execute(sql,(current,)).fetchone()
            conn.close()
            return data[0]

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
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

            conn, cursor = self.get_db_connection()

            sql = "SELECT image_id FROM images WHERE image_id > ?"
            data = cursor.execute(sql, (current,)).fetchall()
            data = [i[0] for i in data]
            conn.close()

            if len(data) >= offset:
                return data[offset-1]
            return self.get_last_image_id()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
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

            conn, cursor = self.get_db_connection()

            sql = "SELECT image_id FROM images WHERE image_id < ?"
            data = cursor.execute(sql, (current,)).fetchall()
            data = [i[0] for i in data]
            conn.close()

            if len(data) >= offset:
                return data[-offset]
            return self.get_first_image_id()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
            return None

    # -----  ANIMATIONS TABLE  -----#

    def create_animation(self, animation_name):
        """
        This Method will create a new animation
        """
        try:
            conn, cursor = self.get_db_connection()

            sql = "INSERT INTO animations VALUES (NULL,?)"
            cursor.execute(sql, (animation_name,))
            conn.commit()
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def load_animation_info_all(self):
        """
        This Method will load all informations from the animations table
        """
        try:
            conn, cursor = self.get_db_connection()
            sql = "SELECT * FROM animations"
            data = cursor.execute(sql).fetchall()
            conn.close()
            return sorted(data, key=lambda x: x[0])

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
            return None

    def delete_animation(self, animation_id):
        """
        This Method will delete all rows with the animation_id
        """
        try:
            conn, cursor = self.get_db_connection()
            sql = "DELETE FROM animations WHERE animation_id=?"
            cursor.execute(sql, (animation_id,))
            conn.commit()
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    # -----  IMAGES_TO_ANIMATIONS TABLE  -----#

    def add_image_to_animation(self, animation_id, image_id, position, time):
        """
        This Method will add a frame to the animation
        """
        try:
            conn, cursor = self.get_db_connection()
            sql = """INSERT INTO images_to_animations (
                animation_id, image_id, pos, sleep_time) VALUES (?,?,?,?)"""
            cursor.execute(sql, (animation_id,image_id,position,time))
            conn.commit()
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def remove_image_from_animation(self, animation_id, position):
        """
        This Method will first remove the row from the images_to_animations table,
        and then update all positions to restore the continuity
        """
        try:
            conn, cursor = self.get_db_connection()
            sql = "DELETE FROM images_to_animations WHERE animation_id=? AND pos=?"
            cursor.execute(sql, (animation_id,position))

            sql = "UPDATE images_to_animations SET pos = pos -1 WHERE animation_id=? AND pos>?"
            cursor.execute(sql, (animation_id,position))
            conn.commit()
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def get_all_animation_thumbnail_ids(self, animation_ids):
        """
        This Method will load the first Frame ID of every Animation
        """
        try:
            conn, cursor = self.get_db_connection()
            sql = "SELECT * FROM images_to_animations"
            data = cursor.execute(sql).fetchall()
            conn.close()

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

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
            return None

    def remove_all_images_from_animation(self, animation_id):
        """
        This Methid will remove every row with this animation_id
        """
        try:
            conn, cursor = self.get_db_connection()
            sql = "DELETE FROM images_to_animations WHERE animation_id=?"
            cursor.execute(sql, (animation_id,))
            conn.commit()
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def load_animation_info_single(self, animation_id):
        """
        This Method will load all informations of this animation
        """
        animationlist = {"imageIDs": [], "imageNames": [], "positions": [], "times": []}

        try:
            conn, cursor = self.get_db_connection()
            sql = "SELECT * FROM images_to_animations where animation_id = ? ORDER BY pos"
            data = cursor.execute(sql, (animation_id,)).fetchall()
            conn.close()
            
            if data:
                for i in data:
                    animationlist["imageIDs"].append(i[1])
                    animationlist["imageNames"].append(self.get_image_name_by_id(i[1])) # Could be done faster!!!
                    animationlist["positions"].append(i[2])
                    animationlist["times"].append(i[3])
            return animationlist

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
            return None

    def update_animation_time_of_single_frame(self, animation_id, position, time):
        """
        This Method will set the sleep_time of a single frame to time
        """
        try:
            conn, cursor = self.get_db_connection()
            sql = "UPDATE images_to_animations SET sleep_time=? WHERE animation_id=? AND pos=?"
            cursor.execute(sql, (time,animation_id,position))
            conn.commit()
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def update_animation_time_of_all_frames(self, animation_id, time):
        """
        This Method will set the sleep_time of all animation frames to time
        """
        try:
            conn, cursor = self.get_db_connection()
            sql = "UPDATE images_to_animations SET sleep_time=? WHERE animation_id=?"
            cursor.execute(sql, (time,animation_id))
            conn.commit()
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def switch_animation_positions(self, animation_id, source_id, target_id):
        """
        This Method will swap the image_id and sleep_time values
        of the animationframes with source_id and target_id
        """
        try:
            conn, cursor = self.get_db_connection()

            sql = """SELECT image_id, sleep_time FROM
                    images_to_animations WHERE animation_id=? And pos=?"""
            source_values = cursor.execute(sql, (animation_id,source_id)).fetchone()

            sql = """SELECT image_id, sleep_time FROM
                    images_to_animations WHERE animation_id=? And pos=?"""
            target_values = cursor.execute(sql, (animation_id,target_id)).fetchone()

            sql = """UPDATE images_to_animations SET
                    image_id=?, sleep_time=? WHERE animation_id=? AND pos=?"""
            cursor.execute(sql, (target_values[0],target_values[1],animation_id,source_id))

            sql = """UPDATE images_to_animations SET
                    image_id=?, sleep_time=? WHERE animation_id=? AND pos=?"""
            cursor.execute(sql, (source_values[0],source_values[1],animation_id,target_id))
            conn.commit()
            conn.close()

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())

    def get_last_position_by_animation_id(self, animation_id):
        """
        This Method will return the highest position of all rows with this animation_id
        """
        try:
            conn, cursor = self.get_db_connection()
            sql = "SELECT MAX(pos) FROM images_to_animations WHERE animation_id=?"
            data = cursor.execute(sql, (animation_id,)).fetchone()
            conn.close()
            return data[0]

        except sqlite3.Error as err:
            error_handler(err,traceback.format_exc())
            return None

def error_handler(err,trace):
    """
    Print Errors that can occurr in the DB Methods
    """
    print(f"SQLite error: {err.args}")
    print("Exception class is: ", err.__class__)
    print("SQLite traceback: ")
    print(trace)
