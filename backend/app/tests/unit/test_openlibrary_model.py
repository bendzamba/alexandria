import pytest
from app.models.openlibrary import Work, Works

@pytest.fixture(scope="function")
def work():
    return Work(
        title="title",
        author_name=["author"],
        first_publish_year=2000,
        cover_edition_key="ABCDE",
        edition_key=["ABCDE", "FGHIJ"]
    )

@pytest.fixture(scope="function")
def works(work):
    return Works(
        works=[work]
    )

def test_work_model_dump(work):

    assert work.model_dump() == {
        "title": "title",
        "author_name": "author",
        "first_publish_year": 2000,
        "olids": ["ABCDE", "FGHIJ"]
    }

def test_works_model_dump(works):

    assert works.model_dump() == [
        {
            "title": "title",
            "author_name": "author",
            "first_publish_year": 2000,
            "olids": ["ABCDE", "FGHIJ"]
        }
    ]