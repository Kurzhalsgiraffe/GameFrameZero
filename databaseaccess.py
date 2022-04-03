import sqlite3

class dao:
    def __init__(self, dbfile):
        self.conn = sqlite3.connect(dbfile, check_same_thread=False)
        self.cursor = self.conn.cursor()
        self.createTables()

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


    def loadBinaryFromDatabase(self, frameID):
        try:
            data = self.cursor.execute("SELECT * FROM images WHERE image_id=?",(frameID,)).fetchall()
            return bytearray(data[0][1])
        except Exception as e:
            print(e)
            return None

    def saveBinaryToDatabase(self, b):
        try:
            self.cursor.execute("INSERT INTO images VALUES (NULL,?)", (b,))
            self.conn.commit()
        except Exception as e:
            print(e)

    def deleteBinaryFromDatabase(self, frameID):
        try:
            self.cursor.execute("DELETE FROM images WHERE image_id=?",(frameID,))
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

    def createAnimation(self, animation_name):
        try:
            self.cursor.execute("INSERT INTO animations VALUES (NULL,?)", (animation_name,))
            self.conn.commit()
        except Exception as e:
            print(e)

    def addImageToAnimation(self, animation_id, image_id, position, time):
        try:
            self.cursor.execute("INSERT INTO images_to_animations (animation_id, image_id, position, time) VALUES (?,?,?,?)", (animation_id,image_id,position,time))
            self.conn.commit()
        except Exception as e:
            print(e)

    def createGroup(self, group_name):
        try:
            self.cursor.execute("INSERT INTO groups (group_id, group_name) VALUES (NULL,?)", (group_name,))
            self.conn.commit()
        except Exception as e:
            print(e)

    def addImageToGroup(self, group_id, image_id):
        try:
            self.cursor.execute("INSERT INTO images_to_groups (group_id, image_id) VALUES (?,?)", (group_id, image_id))
            self.conn.commit()
        except Exception as e:
            print(e)
    