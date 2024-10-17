import pytest
import os
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from app.services.open_library import get_open_library
from app.models.openlibrary import Work, Works
from app.models.exception import ExceptionHandler
from app.db.sqlite import get_db
from sqlmodel.pool import StaticPool  

class OpenLibrary:
    async def fetch_image_from_olid(self, olid: str) -> bool:
        return True

    def get_cover_uri(self) -> str:
        return "12345"
    
    async def search_by_title(self, title: str) -> Works:

        if title == "Nonexistent+Book+Title":
            return ExceptionHandler(status_code=ExceptionHandler.get_no_results_status_code(), message="No results found. Please try a different search.")
        
        work_doc = {
            "title": "title",
            "author_name": ["author"],
            "first_publish_year": 2000,
            "cover_edition_key": "abcde",
            "edition_key": ["abcde", "fghij"]
        }
        return Works(**{"works": [Work(**work_doc)]})

# Using S3 in mocks. Fewer bits to mock
os.environ["STORAGE_BACKEND"] = "s3"
os.environ["LOCAL_IMAGE_DIRECTORY"] = "../../../images"
os.environ["S3_IMAGE_BUCKET"] = "alexandria-images-s3-bucket-production"
os.environ["API_URL"] = "http://localhost:8000"
os.environ["API_IMAGE_MOUNT_PATH"] = "images"
# We need to set environment variables prior to this line to be picked up in main.py
from main import app # noqa

@pytest.fixture(name="session", scope="function")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(scope="function")
def open_library():
    yield OpenLibrary()


@pytest.fixture(name="client", scope="function")  
def client_fixture(session: Session, open_library: OpenLibrary):  
    def get_session_override():  
        return session
    
    def get_open_library_override():
        return open_library

    app.dependency_overrides[get_db] = get_session_override  
    app.dependency_overrides[get_open_library] = get_open_library_override

    client = TestClient(app)  
    yield client  
    app.dependency_overrides.clear()
