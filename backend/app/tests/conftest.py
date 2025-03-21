import os
import pytest

from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session

from app.utils.book_cover import get_book_cover_handler
from app.db.sqlite import get_db
from sqlmodel.pool import StaticPool
from app.models.book import BookCreate, BookUpdate
from app.models.openlibrary import Work, Works
from app.services.open_library.factory import get_open_library  
from app.models.exception import ExceptionHandler

class OpenLibrary:
    async def fetch_image_from_olid(self, olid: str) -> bool:
        return True
    
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


async def book_cover_handler_mock(book_create_or_update: BookCreate | BookUpdate) -> None:
    return None


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


@pytest.fixture(name="open_library", scope="function")
def open_library_fixture():
    yield OpenLibrary()


@pytest.fixture(name="book_cover_handler", scope="function")
def book_cover_handler_fixture():
    yield book_cover_handler_mock


@pytest.fixture(name="client", scope="function")  
def client_fixture(
    session: Session,
    book_cover_handler: book_cover_handler_mock,
    open_library: OpenLibrary
):  
    def get_session_override():  
        return session
    
    def get_book_cover_handler_override():
        return book_cover_handler
    
    def get_open_library_override():
        return open_library

    app.dependency_overrides[get_db] = get_session_override  
    app.dependency_overrides[get_book_cover_handler] = get_book_cover_handler_override
    app.dependency_overrides[get_open_library] = get_open_library_override

    client = TestClient(app)  
    yield client  
    app.dependency_overrides.clear()
