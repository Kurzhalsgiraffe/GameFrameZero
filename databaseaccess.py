import sqlite3

class dao:
    def __init__(self, dbfile):
        try:
            self.conn = sqlite3.connect(dbfile, check_same_thread=False)
            self.cursor = self.conn.cursor()
            self.createTables()
        except Exception as e:
            print(e)
            exit(-1)

    def createTables(self):
        sql = """CREATE TABLE IF NOT EXISTS images (
            image_id integer PRIMARY KEY AUTOINCREMENT,
            image_data blob NOT NULL)"""
        self.cursor.execute(sql)

        sql = """CREATE TABLE IF NOT EXISTS animations (
            animation_id INTEGER PRIMARY KEY AUTOINCREMENT,
            animation_name TEXT NOT NULL)"""
        self.cursor.execute(sql)

        sql = """CREATE TABLE IF NOT EXISTS groups (
            group_id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_name TEXT NOT NULL,
            image_id INTEGER NOT NULL)"""
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

        sql = """CREATE TABLE IF NOT EXISTS images_to_groups (
            group_id INTEGER NOT NULL,
            image_id INTEGER NOT NULL,
            PRIMARY KEY (group_id, image_id),
            FOREIGN KEY (group_id) REFERENCES groups(group_id),
            FOREIGN KEY (image_id) REFERENCES images(image_id))"""
        self.cursor.execute(sql)

    # -----  IMAGES TABLE  -----#

    def loadSingleBinary(self, image_id):
        try:
            data = self.cursor.execute("SELECT * FROM images WHERE image_id=?",(image_id,)).fetchall()
            return bytearray(data[0][1])
        except Exception as e:
            print(e)
            return None
        
    def loadMultipleBinarys(self, ids):
        try:
            arr = []
            for i in ids:
                data = self.cursor.execute("SELECT * FROM images WHERE image_id = ?", (i,)).fetchone()
                if data:
                    arr.append(data)
                else:
                    arr.append(None)
            return arr
        except Exception as e:
            print(e)
            return None

    def saveBinary(self, b):
        try:
            self.cursor.execute("INSERT INTO images VALUES (NULL,?)", (b,))
            self.conn.commit()
        except Exception as e:
            print(e)

    def deleteBinary(self, image_id):
        try:
            self.cursor.execute("DELETE FROM images WHERE image_id=?",(image_id,))
            self.conn.commit()
        except Exception as e:
            print(e)

    def getFirstID(self):
        try:
            data = self.cursor.execute("SELECT MIN(image_id) FROM images").fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None

    def getLastID(self):
        try:
            data = self.cursor.execute("SELECT MAX(image_id) FROM images").fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None

    def getNextID(self, current):
        try:
            if current == self.getLastID():
                return self.getFirstID()
            data = self.cursor.execute("SELECT MIN(image_id) FROM images WHERE image_id > ?",(current,)).fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None

    def getPreviousID(self, current):
        try:
            if current == self.getFirstID():
                return self.getLastID()
            data = self.cursor.execute("SELECT MAX(image_id) FROM images WHERE image_id < ?",(current,)).fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None

    # -----  ANIMATIONS TABLE  -----#

    def createAnimation(self, animation_name):
        try:
            self.cursor.execute("INSERT INTO animations VALUES (NULL,?)", (animation_name,))
            self.conn.commit()
        except Exception as e:
            print(e)

    def getAllAnimations(self):
        try:
            data = self.cursor.execute("SELECT * FROM animations").fetchall()
            return data
        except Exception as e:
            print(e)

    def deleteAnimation(self, animation_id):
        try:
            self.cursor.execute("DELETE FROM animations WHERE animation_id=?",(animation_id,))
            self.conn.commit()
        except Exception as e:
            print(e)

    # -----  IMAGES_TO_ANIMATIONS TABLE  -----#

    def addImageToAnimation(self, animation_id, image_id, position, time):
        try:
            self.cursor.execute("INSERT INTO images_to_animations (animation_id, image_id, pos, sleep_time) VALUES (?,?,?,?)", (animation_id,image_id,position,time))
            self.conn.commit()
        except Exception as e:
            print(e)

    def getAllAnimationThumbnails(self, animation_ids):
        try:
            data = self.cursor.execute("SELECT * FROM images_to_animations").fetchall()    
            s = sorted(data, key=lambda x: (x[0], x[2]))
            d = []
            used = []
            ret = []
            for i in s:
                animation_id = i[0]
                if animation_id not in used:
                    used.append(animation_id)
                    d.append(i)

            for i in animation_ids:
                for j in d:
                    if j[0] == i:
                        ret.append(j[1])
                        break
                else:
                    ret.append(None)

            return ret
        except Exception as e:
            print(e)

    def getAnimationByID(self, animation_id):
        try:
            data = self.cursor.execute("SELECT * FROM images_to_animations where animation_id = ? ORDER BY pos", (animation_id,)).fetchall()
            return data
        except Exception as e:
            print(e)

    def removeAllImagesFromAnimation(self, animation_id):
        try:
            self.cursor.execute("DELETE FROM images_to_animations WHERE animation_id=?",(animation_id,))
            self.conn.commit()
        except Exception as e:
            print(e)

    # -----  GROUPS TABLE  -----#

    def createGroup(self, group_name):
        try:
            self.cursor.execute("INSERT INTO groups (group_id, group_name) VALUES (NULL,?)", (group_name,))
            self.conn.commit()
        except Exception as e:
            print(e)

    # -----  IMAGES_TO_GROUPS TABLE  -----#

    def addImageToGroup(self, group_id, image_id):
        try:
            self.cursor.execute("INSERT INTO images_to_groups (group_id, image_id) VALUES (?,?)", (group_id, image_id))
            self.conn.commit()
        except Exception as e:
            print(e)
    