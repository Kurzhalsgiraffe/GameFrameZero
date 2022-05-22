import sqlite3

class Dao:
    def __init__(self, dbfile):
        try:
            self.conn = sqlite3.connect(dbfile, check_same_thread=False)
            self.cursor = self.conn.cursor()
            self.create_tables()
        except Exception as exception:
            print(exception)
            exit(-1)

    def create_tables(self):
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
        try:
            data = self.cursor.execute("SELECT * FROM images WHERE image_id=?",(image_id,)).fetchall()
            return bytearray(data[0][1])
        except Exception as exception:
            print(exception)
            return None
        
    def load_multiple_binarys(self, ids):
        try:
            arr = []
            for i in ids:
                data = self.cursor.execute("SELECT * FROM images WHERE image_id = ?", (i,)).fetchone()
                if data:
                    arr.append(data)
                else:
                    arr.append(None)
            return arr
        except Exception as exception:
            print(exception)
            return None

    def save_binary(self, b):
        try:
            self.cursor.execute("INSERT INTO images VALUES (NULL,?)", (b,))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def delete_binary(self, image_id):
        try:
            self.cursor.execute("DELETE FROM images WHERE image_id=?",(image_id,))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def get_first_image_id(self):
        try:
            data = self.cursor.execute("SELECT MIN(image_id) FROM images").fetchone()
            return data[0]
        except Exception as exception:
            print(exception)
            return None

    def get_last_image_id(self):
        try:
            data = self.cursor.execute("SELECT MAX(image_id) FROM images").fetchone()
            return data[0]
        except Exception as exception:
            print(exception)
            return None

    def get_next_image_id(self, current):
        try:
            if current >= self.get_last_image_id():
                return self.get_first_image_id()
            data = self.cursor.execute("SELECT MIN(image_id) FROM images WHERE image_id > ?",(current,)).fetchone()
            return data[0]
        except Exception as exception:
            print(exception)
            return None

    def get_previous_image_id(self, current):
        try:
            if current == self.get_first_image_id():
                return self.get_last_image_id()
            data = self.cursor.execute("SELECT MAX(image_id) FROM images WHERE image_id < ?",(current,)).fetchone()
            return data[0]
        except Exception as exception:
            print(exception)
            return None

    def get_fbw_image_id(self, current, offset):
        try:
            if offset < 0:
                offset = 0
            elif offset == 0:
                return current
            
            data = self.cursor.execute("SELECT image_id FROM images WHERE image_id > ?",(current,)).fetchall()
            data = [i[0] for i in data]
            if len(data) >= offset:
                return data[offset-1]
            return self.get_last_image_id()
        except Exception as exception:
            print(exception)
            return None

    def get_ffw_image_id(self, current, offset):
        try:
            if offset < 0:
                offset = 0
            elif offset == 0:
                return current

            data = self.cursor.execute("SELECT image_id FROM images WHERE image_id < ?",(current,)).fetchall()
            data = [i[0] for i in data]
            if len(data) >= offset:
                return data[-offset]
            return self.get_first_image_id()
        except Exception as exception:
            print(exception)
            return None

    # -----  ANIMATIONS TABLE  -----#

    def create_animation(self, animation_name):
        try:
            self.cursor.execute("INSERT INTO animations VALUES (NULL,?)", (animation_name,))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def get_all_animations(self):
        try:
            data = self.cursor.execute("SELECT * FROM animations").fetchall()
            return data
        except Exception as exception:
            print(exception)

    def delete_animation(self, animation_id):
        try:
            self.cursor.execute("DELETE FROM animations WHERE animation_id=?",(animation_id,))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    # -----  IMAGES_TO_ANIMATIONS TABLE  -----#

    def add_image_to_animation(self, animation_id, image_id, position, time):
        try:
            self.cursor.execute("INSERT INTO images_to_animations (animation_id, image_id, pos, sleep_time) VALUES (?,?,?,?)", (animation_id,image_id,position,time))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def remove_image_from_animation(self, animation_id, position):
        try:
            self.cursor.execute("DELETE FROM images_to_animations WHERE animation_id=? AND pos=?", (animation_id,position))                 # delete it
            self.cursor.execute("UPDATE images_to_animations SET pos = pos -1 WHERE animation_id=? AND pos>?", (animation_id,position))     # update pos on every frame with higher pos
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def get_all_animation_thumbnails(self, animation_ids):
        try:
            data = self.cursor.execute("SELECT * FROM images_to_animations").fetchall()
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

    def remove_all_images_from_animation(self, animation_id):
        try:
            self.cursor.execute("DELETE FROM images_to_animations WHERE animation_id=?",(animation_id,))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def get_animation_by_id(self, animation_id):
        try:
            data = self.cursor.execute("SELECT * FROM images_to_animations where animation_id = ? ORDER BY pos", (animation_id,)).fetchall()
            return data
        except Exception as exception:
            print(exception)

    def update_animation_time_of_single_frame(self, animation_id, position, time):
        try:
            self.cursor.execute("UPDATE images_to_animations SET sleep_time=? WHERE animation_id=? AND pos=?", (time,animation_id,position))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def update_animation_time_of_all_frames(self, animation_id, time):
        try:
            self.cursor.execute("UPDATE images_to_animations SET sleep_time=? WHERE animation_id=?", (time,animation_id))
            self.conn.commit()
        except Exception as exception:
            print(exception)
    
    def switch_animation_positions(self, animation_id, source_id, target_id):
        try:
            source_values = self.cursor.execute("SELECT image_id, sleep_time FROM images_to_animations WHERE animation_id=? And pos=?", (animation_id,source_id)).fetchone()
            target_values = self.cursor.execute("SELECT image_id, sleep_time FROM images_to_animations WHERE animation_id=? And pos=?", (animation_id,target_id)).fetchone()
            self.cursor.execute("UPDATE images_to_animations SET image_id=?, sleep_time=? WHERE animation_id=? AND pos=?", (target_values[0],target_values[1],animation_id,source_id))
            self.cursor.execute("UPDATE images_to_animations SET image_id=?, sleep_time=? WHERE animation_id=? AND pos=?", (source_values[0],source_values[1],animation_id,target_id))
            self.conn.commit()
        except Exception as exception:
            print(exception)

    def get_last_position_by_animation_id(self, animation_id):
        try:
            data = self.cursor.execute("SELECT MAX(pos) FROM images_to_animations WHERE animation_id=?", (animation_id,)).fetchone()
            return data[0]
        except Exception as exception:
            print(exception)
            return None