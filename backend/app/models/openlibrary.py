from pydantic import BaseModel
from typing import Optional

class Work(BaseModel):
    title: str
    author_name: list[str]
    first_publish_year: int
    # If there are no covers we can use a default image
    cover_edition_key: Optional[str] = None
    edition_key: Optional[list[str]] = []

    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        # Replace the 'author' field with the first author
        data['author_name'] = self.author_name[0]
        if self.cover_edition_key is not None:
            if self.cover_edition_key in self.edition_key:
                self.edition_key.insert(0, self.edition_key.pop(self.edition_key.index(self.cover_edition_key)))
                data['edition_keys'] = self.edition_key
            else:
                data['edition_keys'] = [self.cover_edition_key] + self.edition_key
        else:
            data['edition_keys'] = self.edition_key
        del data['cover_edition_key']
        del data['edition_key']
        return data