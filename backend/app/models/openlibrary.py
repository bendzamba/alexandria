from pydantic import BaseModel
from typing import Optional

class Work(BaseModel):
    title: str
    author_name: list[str]
    first_publish_year: int
    # If there are no covers we can use a default image
    # It's worth noting that, though I can't find specific documentation around this,
    # it seems that both `cover_edition_key` and `edition_key` always contain OLID, as opposed
    # to other IDs used by Open Library. I believe this is always indicated by the prefix `OL`
    cover_edition_key: Optional[str] = None
    edition_key: Optional[list[str]] = []

    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        # Replace the 'author' field with the first author
        data['author_name'] = self.author_name[0]
        if self.cover_edition_key is not None:
            if self.cover_edition_key in self.edition_key:
                self.edition_key.insert(0, self.edition_key.pop(self.edition_key.index(self.cover_edition_key)))
                data['olids'] = self.edition_key
            else:
                data['olids'] = [self.cover_edition_key] + self.edition_key
        else:
            data['olids'] = self.edition_key
        del data['cover_edition_key']
        del data['edition_key']
        return data