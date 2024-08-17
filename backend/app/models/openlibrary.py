from pydantic import BaseModel

class Work(BaseModel):
    title: str
    author_name: list[str]
    first_publish_year: int
    cover_edition_key: str
    edition_key: list[str]

    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        # Replace the 'author' field with the first author
        data['author_name'] = self.author_name[0]
        return data