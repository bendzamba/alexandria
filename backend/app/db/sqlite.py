from sqlmodel import create_engine
import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

class DB:
    def __init__(self):
        self.sqlite_url = os.getenv('DATABASE_URL')
        self.connect_args = {"check_same_thread": False}
        self.engine = create_engine(
            self.sqlite_url, echo=True, connect_args=self.connect_args
        )

    def get_engine(self):
        return self.engine

    def execute(self):
        pass

    def close(self):
        pass


def get_db():
    db = DB()
    try:
        yield db
    finally:
        db.close()
