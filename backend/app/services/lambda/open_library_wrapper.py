import json
from book_search import get_book_search

async def lambda_handler(event, context):
    
    title = event.get("title")

    service = get_book_search()

    result = await service.search_by_title(title=title)
    
    return {
        "statusCode": 200,
        "body": json.dumps(result)
    }
