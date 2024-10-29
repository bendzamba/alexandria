import os

from app.services.open_library.local import LocalOpenLibraryHandler
from app.services.open_library.remote import RemoteOpenLibraryHandler

def get_open_library():
    
    is_running_in_lambda = os.getenv('AWS_EXECUTION_ENV') is not None
    
    if is_running_in_lambda:
        # We need our remote handler to escape our VPC for internet access
        return RemoteOpenLibraryHandler()
    
    # We are not constrained by a VPC and so can access the internet
    return LocalOpenLibraryHandler()