import sqlite3

def rename_cover_image_to_cover_uri_in_books_table():
    connection = sqlite3.connect('backend/app/bookshelf.db', check_same_thread=False)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute('ALTER TABLE books RENAME cover_image TO cover_uri;')
    connection.commit()

def add_cover_olid_to_books_table():
    connection = sqlite3.connect('backend/app/bookshelf.db', check_same_thread=False)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute('''
        ALTER TABLE books
        ADD COLUMN cover_olid TEXT;
    ''')
    connection.commit()

def remove_column_from_table(column: str, table: str):
    connection = sqlite3.connect('backend/app/bookshelf.db', check_same_thread=False)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute(f'''
        ALTER TABLE {table}
        DROP COLUMN {column};
    ''')
    connection.commit()

def show_table_schema(table: str):
    connection = sqlite3.connect('backend/app/bookshelf.db', check_same_thread=False)
    cursor = connection.cursor()
    cursor.execute(f'''
        PRAGMA table_info({table});  
    ''')
    connection.commit()
    print(cursor.fetchall())

def rename_cover_olid_to_olid_in_books_table():
    connection = sqlite3.connect('backend/app/bookshelf.db', check_same_thread=False)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute('ALTER TABLE books RENAME cover_olid TO olid;')
    connection.commit()

# rename_cover_image_to_cover_uri_in_books_table()
# add_cover_olid_to_books_table()
# show_table_schema('books')
# remove_column_from_table('bookshelf_id', 'books')
rename_cover_olid_to_olid_in_books_table()