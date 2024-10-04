from sqlmodel import create_engine, Session
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path('.env')
if env_path.exists():
    # Load environment variables from a .env file
    load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv('DATABASE_URL')

engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})

def get_engine():
    return engine

def get_db():
    with Session(engine) as session:
        yield session
