from pydantic import BaseModel, create_model
from typing import Optional
from enum import StrEnum

class Category(StrEnum):
    action_adventure = "Action & Adventure"
    art_photography = "Art & Photography"
    biography = "Biography"
    children_s = "Children's"
    contemporary_fiction = "Contemporary Fiction"
    dystopian = "Dystopian"
    essays = "Essays"
    fantasy = "Fantasy"
    food_drink = "Food & Drink"
    graphic_novel = "Graphic Novel"
    guide_how_to = "Guide/How-to"
    historical_fiction = "Historical Fiction"
    history = "History"
    horror = "Horror"
    humanities_social_sciences = "Humanities & Social Sciences"
    humor = "Humor"
    lgbtq = "LGBTQ+"
    literary_fiction = "Literary Fiction"
    magical_realism = "Magical Realism"
    memoir_autobiography = "Memoir & Autobiography"
    mystery = "Mystery"
    new_adult = "New Adult"
    parenting_families = "Parenting & Families"
    religion_spirituality = "Religion & Spirituality"
    romance = "Romance"
    science_technology = "Science & Technology"
    science_fiction = "Science Fiction"
    self_help = "Self-help"
    short_story = "Short Story"
    thriller_suspense = "Thriller & Suspense"
    travel = "Travel"
    true_crime = "True Crime"
    women_s_fiction = "Women's Fiction"
    young_adult = "Young Adult"

class Book(BaseModel):
    title: str
    author: str
    year: int
    category: Category
    olid: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None

class BookIds(BaseModel):
    book_ids: list[int]

BookUpdate = create_model(
    'BookUpdate',
    **{field: (Optional[type_hint], None) for field, type_hint in Book.__annotations__.items()}
)