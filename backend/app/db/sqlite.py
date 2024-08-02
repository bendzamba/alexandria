import sqlite3

class DB:

    def __init__(self):
        self.connection = sqlite3.connect('bookshelf.db', check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        self.cursor = self.connection.cursor()
        self.cursor.execute("PRAGMA foreign_keys = ON")
        self.connection.commit()
    
    def execute(self, query: str, values: tuple = ()):
        self.cursor.execute(query, values)
        self.connection.commit()
        return self.cursor
        
    def close(self):
        self.connection.close()
    

def get_db():
    db = DB()
    try:
        yield db
    finally:
        db.close()