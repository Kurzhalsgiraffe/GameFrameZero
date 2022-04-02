import sqlite3

class dao:
    def __init__(self, dbfile):
        self.conn = sqlite3.connect(dbfile, check_same_thread=False)
        self.cursor = self.conn.cursor()
        self.createImagesTable()

    def createImagesTable(self):
        sql = """CREATE TABLE IF NOT EXISTS images (
            id integer PRIMARY KEY AUTOINCREMENT,
            img blob NOT NULL)"""
        self.cursor.execute(sql)

    def loadBinaryFromDatabase(self, frameID):
        try:
            data = self.cursor.execute("SELECT * FROM images WHERE id=?",(frameID,)).fetchall()
            return bytearray(data[0][1])
        except:
            return None

    def saveBinaryToDatabase(self, b):
        self.cursor.execute("INSERT INTO images VALUES (NULL,?)", (b,))
        self.conn.commit()

    def deleteBinaryFromDatabase(self, frameID):
        self.cursor.execute("DELETE FROM images WHERE id=?",(frameID,))
        self.conn.commit()

    def getFirstID(self):
        try:
            data = self.cursor.execute("SELECT MIN(id) FROM images").fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None

    def getLastID(self):
        try:
            data = self.cursor.execute("SELECT MAX(id) FROM images").fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None

    def getNextID(self, current):
        try:
            if current == self.getLastID():
                return self.getFirstID()
            data = self.cursor.execute("SELECT MIN(id) FROM images WHERE id > ?",(current,)).fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None

    def getPreviousID(self, current):
        try:
            if current == self.getFirstID():
                return self.getLastID()
            data = self.cursor.execute("SELECT MAX(id) FROM images WHERE id < ?",(current,)).fetchone()
            return data[0]
        except Exception as e:
            print(e)
            return None