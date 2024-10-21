import os
from app.services.open_library.local import LocalOpenLibraryHandler

def lambda_handler(event, context):
    
    method = event.get('method')
    arguments = event.get('arguments')
    
    if method is None:
        print("We did not receive a method")
        return None

    if method not in dir(os):
        print("We did not recognize the method", method)
        return None

    if arguments is None:
        print("We did not receive any arguments")
        return None
    
    open_library = LocalOpenLibraryHandler()
    return getattr(open_library, method)(**arguments)