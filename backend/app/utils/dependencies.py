from fastapi import Depends, Request, HTTPException
from pydantic import BaseModel
from typing import Type, TypeVar

# Define a generic TypeVar for any Pydantic model
_TModel = TypeVar("_TModel", bound=BaseModel)

# This allows us to validate against either JSON or Form Data for a POST request
def form_or_json(model: Type[_TModel]) -> _TModel:
    async def form_or_json_inner(request: Request) -> _TModel:
        content_type = request.headers.get("Content-Type", "").split(";", 1)[0]
        if content_type == "application/json":
            data = await request.json()
        elif content_type == "multipart/form-data":
            data = await request.form()
        else:
            raise HTTPException(status_code=400, detail="Unsupported Content-Type")
        return model.model_validate(data)
    return Depends(form_or_json_inner)