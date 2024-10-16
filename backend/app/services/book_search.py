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

USE_LAMBDA = os.getenv('USE_LAMBDA', 'false').lower() == 'true'

class BookSearch:
  def __init__(self, use_lambda: bool):
    self.use_lambda = use_lambda
      
  async def search_by_title(self, title: str):
    if self.use_lambda:
      openlibrary_lambda_function = os.getenv('OPENLIBRARY_LAMBDA_FUNCTION_NAME')
      return self.call_lambda(
        title=title,
        openlibrary_lambda_function=openlibrary_lambda_function
      )
    else:
      # Call the third-party API directly (for local dev or Docker)
      return await self.call_direct(title=title)
      
  def call_lambda(self, title: str, openlibrary_lambda_function: str):
      # Invoke our separate Lambda function
      lambda_client = boto3.client('lambda')
      response = lambda_client.invoke(
        FunctionName=openlibrary_lambda_function,
        InvocationType="RequestResponse",
        Payload=json.dumps({"title": title})
      )
      payload = response["Payload"].read()
      return json.loads(payload)

  async def call_direct(self, title: str):
    openlibrary = OpenLibrary()
    return await openlibrary.search_by_title(title=title)


def get_book_search():
  book_search = BookSearch(
    use_lambda=USE_LAMBDA
  )
  try:
    yield book_search
  finally:
    pass