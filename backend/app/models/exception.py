from pydantic import BaseModel
from fastapi import status

class ExceptionHandler(BaseModel):
    status_code: int
    message: str

    def get_timeout_status_code():
        return status.HTTP_504_GATEWAY_TIMEOUT
    
    def get_generic_status_code():
        return status.HTTP_502_BAD_GATEWAY
    
    def get_no_results_status_code():
        return status.HTTP_404_NOT_FOUND