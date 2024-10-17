import json
import os
import boto3
from pathlib import Path
from dotenv import load_dotenv
from backend.app.services.open_library import OpenLibrary

env_path = Path('.env')
if env_path.exists():
    # Load environment variables from a .env file
    load_dotenv(dotenv_path=env_path)

class BookSearch:
  def __init__(self):
    pass 

  async def search_by_title(self, title: str):
    # If we are in Lambda, we are behind a VPC, so we need to invoke our separate
    # Lambda running outside of the VPC
    if self.is_running_in_lambda():
      openlibrary_lambda_function = os.getenv('NON_VPC_LAMBDA_FUNCTION_NAME')
      return self.call_lambda(
        title=title,
        openlibrary_lambda_function=openlibrary_lambda_function
      )
    
    # Not running in Lambda, use local call
    return await self.call_direct(title=title)
      
  def is_running_in_lambda():
    return os.getenv('AWS_EXECUTION_ENV') is not None
  
  def call_lambda(self, title: str, openlibrary_lambda_function: str):
      # Here we emulate an API Gateway call to our Lambda to search for the book
      lambda_client = boto3.client('lambda')
      event_payload = {
        "httpMethod": "GET",
        "path": f"/books/search/{title}",
        "headers": {
            "accept": "*/*",
            "User-Agent": "Mozilla/5.0 ..."
        },
        "queryStringParameters": None,
        "body": None,
        "isBase64Encoded": False,
        "requestContext": {
            "resourcePath": f"/books/search/{title}",
            "httpMethod": "GET",
            "domainName": "api.myalexandria.ai",
            "requestId": "unique-request-id" # Uniqueness is not a requirement
        },
        "pathParameters": {
            "proxy": "books"
        }
      }
      response = lambda_client.invoke(
        FunctionName=openlibrary_lambda_function,
        InvocationType="RequestResponse",
        Payload=json.dumps(event_payload)
      )
      payload = response["Payload"].read()
      return json.loads(payload)

  async def call_direct(self, title: str):
    openlibrary = OpenLibrary()
    return await openlibrary.search_by_title(title=title)


def get_book_search():
  book_search = BookSearch()
  try:
    yield book_search
  finally:
    pass