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

    def getFirstImageID(self):
        try:
            data = self.cursor.execute("SELECT MIN(image_id) FROM images").fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None

    def getLastImageID(self):
        try:
            data = self.cursor.execute("SELECT MAX(image_id) FROM images").fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None

    def getNextImageID(self, current):
        try:
            if current >= self.getLastImageID():
                return self.getFirstImageID()
            data = self.cursor.execute("SELECT MIN(image_id) FROM images WHERE image_id > ?",(current,)).fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None

    def getPreviousImageID(self, current):
        try:
            if current == self.getFirstImageID():
                return self.getLastImageID()
            data = self.cursor.execute("SELECT MAX(image_id) FROM images WHERE image_id < ?",(current,)).fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None

    def getFBWImageID(self, current, offset):
        try:
            if offset < 0:
                offset = 0
            elif offset == 0:
                return current
            
            data = self.cursor.execute("SELECT image_id FROM images WHERE image_id > ?",(current,)).fetchall()
            data = [i[0] for i in data]
            if len(data) >= offset:
                return data[offset-1]
            return self.getLastImageID()
        except Exception as e:
            print(e)
            return None

    def getFFWImageID(self, current, offset):
        try:
            if offset < 0:
                offset = 0
            elif offset == 0:
                return current

            data = self.cursor.execute("SELECT image_id FROM images WHERE image_id < ?",(current,)).fetchall()
            data = [i[0] for i in data]
            if len(data) >= offset:
                return data[-offset]
            return self.getFirstImageID()
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

    def RemoveImageFromAnimation(self, animation_id, position):
        try:
            self.cursor.execute("DELETE FROM images_to_animations WHERE animation_id=? AND pos=?", (animation_id,position))                 # delete it
            self.cursor.execute("UPDATE images_to_animations SET pos = pos -1 WHERE animation_id=? AND pos>?", (animation_id,position))     # update pos on every frame with higher pos
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

    def removeAllImagesFromAnimation(self, animation_id):
        try:
            self.cursor.execute("DELETE FROM images_to_animations WHERE animation_id=?",(animation_id,))
            self.conn.commit()
        except Exception as e:
            print(e)

    def getAnimationByID(self, animation_id):
        try:
            data = self.cursor.execute("SELECT * FROM images_to_animations where animation_id = ? ORDER BY pos", (animation_id,)).fetchall()
            return data
        except Exception as e:
            print(e)

    def UpdateAnimationTimeOfFrame(self, animation_id, position, time):
        try:
            self.cursor.execute("UPDATE images_to_animations SET sleep_time=? WHERE animation_id=? AND pos=?", (time,animation_id,position))
            self.conn.commit()
        except Exception as e:
            print(e)

    def UpdateAnimationTimeOfAllFrames(self, animation_id, time):
        try:
            self.cursor.execute("UPDATE images_to_animations SET sleep_time=? WHERE animation_id=?", (time,animation_id))
            self.conn.commit()
        except Exception as e:
            print(e)
    
    def SwitchPositions(self, animation_id, source_id, target_id):
        try:
            source_values = self.cursor.execute("SELECT image_id, sleep_time FROM images_to_animations WHERE animation_id=? And pos=?", (animation_id,source_id)).fetchone()
            target_values = self.cursor.execute("SELECT image_id, sleep_time FROM images_to_animations WHERE animation_id=? And pos=?", (animation_id,target_id)).fetchone()
            self.cursor.execute("UPDATE images_to_animations SET image_id=?, sleep_time=? WHERE animation_id=? AND pos=?", (target_values[0],target_values[1],animation_id,source_id))
            self.cursor.execute("UPDATE images_to_animations SET image_id=?, sleep_time=? WHERE animation_id=? AND pos=?", (source_values[0],source_values[1],animation_id,target_id))
            self.conn.commit()
        except Exception as e:
            print(e)

    def getLastPositionByAnimationID(self, animation_id):
        try:
            data = self.cursor.execute("SELECT MAX(pos) FROM images_to_animations WHERE animation_id=?", (animation_id,)).fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None

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
    