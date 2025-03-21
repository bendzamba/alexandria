import json
import os
import boto3
import inspect
from app.services.open_library.base import BaseOpenLibraryHandler
from app.models.exception import ExceptionHandler
from app.models.openlibrary import Works, Work


class RemoteOpenLibraryHandler(BaseOpenLibraryHandler):

  def __init__(self):
    self.openlibrary_lambda_function = os.getenv('NON_VPC_LAMBDA_FUNCTION_NAME')
    self.lambda_client = boto3.client('lambda')

  async def search_by_title(self, title: str) -> Works | ExceptionHandler:
    
    event_payload = {
      "method": inspect.currentframe().f_code.co_name,
      "arguments": {
        "title": title
      }
    }

    remote_response = await self._invoke_lambda(event_payload=event_payload)

    # We need to transform this back into a format we'd expect from Open Library's API to handle it gracefully
    remote_response_transformed = []
    for doc in remote_response:
      transformed_doc = doc
      # Convert author back to list
      transformed_doc["author_name"] = [doc["author_name"]]
      # Split OLIDs back into original keys
      transformed_doc["cover_edition_key"] = doc["olids"][0]
      transformed_doc["edition_key"] = doc["olids"]
      # Remove olids key
      del transformed_doc["olids"]
      remote_response_transformed.append(transformed_doc)

    works = []
    for doc in remote_response_transformed:
      works.append(Work(**doc))
      
    return Works(**{"works": works})

  async def fetch_image_from_olid(self, olid: str) -> str:

    event_payload = {
      "method": inspect.currentframe().f_code.co_name,
      "arguments": {
        "olid": olid
      }
    }

    return await self._invoke_lambda(event_payload=event_payload)
  
  async def _invoke_lambda(self, event_payload: dict):

    response = self.lambda_client.invoke(
      FunctionName=self.openlibrary_lambda_function,
      InvocationType="RequestResponse",
      Payload=json.dumps(event_payload)
    )
    payload = response["Payload"].read()
    
    return json.loads(payload)