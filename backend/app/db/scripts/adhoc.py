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

def add_rating_and_review_to_books_table():
    connection = sqlite3.connect('backend/app/bookshelf.db', check_same_thread=False)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute('''
        ALTER TABLE books
        ADD COLUMN rating INT;
    ''')
    cursor.execute('''
        ALTER TABLE books
        ADD COLUMN review TEXT;
    ''')
    connection.commit()

def remove_category_column_from_book_table():
    connection = sqlite3.connect('backend/app/bookshelf.db', check_same_thread=False)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute('''
        ALTER TABLE books
        DROP COLUMN category;
    ''')
    connection.commit()

def drop_tables_book_and_bookshelf():
    connection = sqlite3.connect('backend/app/bookshelf.db', check_same_thread=False)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute('''
        DROP TABLE book;
    ''')
    cursor.execute('''
        DROP TABLE bookshelf;
    ''')
    connection.commit()

# rename_cover_image_to_cover_uri_in_books_table()
# add_cover_olid_to_books_table()
# show_table_schema('books')
# remove_column_from_table('bookshelf_id', 'books')
# rename_cover_olid_to_olid_in_books_table()
# add_rating_and_review_to_books_table()
# remove_category_column_from_book_table()
# drop_tables_book_and_bookshelf()