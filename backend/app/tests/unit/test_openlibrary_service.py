import pytest
from app.services.openlibrary import OpenLibrary

@pytest.fixture(scope="function")
def open_library():
    return OpenLibrary()

def test_build_search_url(open_library):

    result = open_library.build_search_url("The Great Gatsby")

    expected = "https://openlibrary.org/search.json?title=The%20Great%20Gatsby&fields=title%2Cauthor_name%2Cfirst_publish_year%2Ccover_edition_key%2Cedition_key"

    assert result == expected


def test_build_image_url_from_olid(open_library):

    result = open_library.build_image_url_from_olid("ABCDE")

    assert result == "https://covers.openlibrary.org/b/olid/ABCDE-L.jpg"