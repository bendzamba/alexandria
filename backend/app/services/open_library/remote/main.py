import asyncio
from app.services.open_library.local import LocalOpenLibraryHandler


def handler(event, context):

    method = event.get('method')
    arguments = event.get('arguments')
    
    if method is None:
        print("We did not receive a method")
        return None

    if not hasattr(LocalOpenLibraryHandler, method):
        print("We did not recognize the method", method)
        return None

    if arguments is None:
        print("We did not receive any arguments")
        return None

    loop = asyncio.get_event_loop()

    return loop.run_until_complete(async_handler(method, arguments))


async def async_handler(method, arguments):
    open_library = LocalOpenLibraryHandler()
    response = await getattr(open_library, method)(**arguments)

    if hasattr(response, "model_dump"):
        # We need to serialize the response
        return response.model_dump()
    
    return response