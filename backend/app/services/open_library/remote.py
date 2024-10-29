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

    works = []
    for doc in remote_response:
      works.append(Work(**doc))
      
    return Works(**{"works": works})

  async def fetch_image_from_olid(self, olid: str | None) -> str:

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