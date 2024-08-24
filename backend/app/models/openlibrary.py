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
        data["author_name"] = self.author_name[0]
        if self.cover_edition_key is not None:
            if self.cover_edition_key in self.edition_key:
                self.edition_key.insert(
                    0,
                    self.edition_key.pop(
                        self.edition_key.index(self.cover_edition_key)
                    ),
                )
                data["olids"] = self.edition_key
            else:
                data["olids"] = [self.cover_edition_key] + self.edition_key
        else:
            data["olids"] = self.edition_key
        del data["cover_edition_key"]
        del data["edition_key"]
        return data


class Works(BaseModel):

    works: list[Work]

    def model_dump(self):

        dumped_works = [super_work.model_dump() for super_work in self.works]

        # Initialize an empty set to track seen authors
        seen_authors = set()
        deduplicated_list = []

        # Loop through the list of dictionaries
        for work in dumped_works:
            # Check if the author is already in the seen_authors set
            if work["author_name"] not in seen_authors:
                # If not, add the author to the set and the entry to the deduplicated list
                seen_authors.add(work["author_name"])
                deduplicated_list.append(work)

        return deduplicated_list
