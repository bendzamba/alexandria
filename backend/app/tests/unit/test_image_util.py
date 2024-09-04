import pytest
import os
from app.utils.image import Image

@pytest.fixture(scope="function")
def image():
    return Image()


def test_sanitize_book_title_for_filename(image):

    titles = [
        "All The President's Men",
        "Franny & Zooey",
        "Who’s Afraid of Virginia Woolf?",
        "Eats, Shoots & Leaves"
    ]

    sanitized_titles = [
        "All_The_Presidents_Men",
        "Franny__Zooey",
        "Whos_Afraid_of_Virginia_Woolf",
        "Eats_Shoots__Leaves"
    ]

    for title, sanitized_title in zip(titles, sanitized_titles):
        assert image.sanitize_book_title_for_filename(title) == sanitized_title


def test_determine_local_file_destination(image):

    result = image.determine_local_file_destination("my_filename")

    assert result == os.getenv("IMAGES_DIRECTORY_PATH") + os.getenv("IMAGES_DIRECTORY_NAME") + "/my_filename.jpg"


def test_get_default_cover_with_path_for_database(image):

    result = image.get_default_cover_with_path_for_database()

    assert result == "/" + os.getenv("IMAGES_DIRECTORY_NAME") + "/No_Image_Available.jpg"


def test_get_cover_with_path_for_database(image):

    result = image.get_cover_with_path_for_database("my_filename")

    assert result == "/" + os.getenv("IMAGES_DIRECTORY_NAME") + "/my_filename.jpg"