import sqlite3

class DB:

    def __init__(self):
        self.connection = sqlite3.connect('bookshelf.db', check_same_thread=False)
        self.cursor = self.connection.cursor()
        # self.cursor.execute('''DROP TABLE IF EXISTS bookshelves''')
        # self.cursor.execute('''DROP TABLE IF EXISTS books''')
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS bookshelves (
                id INTEGER PRIMARY KEY, 
                title TEXT, 
                description TEXT
            )
        ''')
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY, 
                title TEXT, 
                author TEXT, 
                year INTEGER, 
                bookshelf_id INTEGER, 
                category TEXT, 
                cover_image TEXT
            )
        ''')
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS bookshelves_books (
                bookshelf_id INTEGER,
                book_id INTEGER,
                PRIMARY KEY (bookshelf_id, book_id),
                FOREIGN KEY (bookshelf_id) REFERENCES bookshelves (id),
                FOREIGN KEY (book_id) REFERENCES books (id)
            )
        ''')
        self.connection.commit()
    
    def execute(self, query: str, values: tuple = ()):
        self.cursor.execute(query, values)
        self.connection.commit()
        return self.cursor
        
    def close(self):
        self.connection.close()
    