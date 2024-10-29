#!/bin/bash

# Build expected directory structure
mkdir lambda_package
mkdir lambda_package/app
mkdir lambda_package/app/models
mkdir lambda_package/app/services
mkdir lambda_package/app/utils

# Copy in our Lambda handler
cp ./lambda_handler.py lambda_package/app/lambda_handler.py

# Copy in required files used by Open Library
cp ../local.py lambda_package/app/services/open_library/local.py
cp ../base.py lambda_package/app/services/open_library/base.py
cp ../../../__init__.py lambda_package/app/__init__.py
cp ../../../models/openlibrary.py lambda_package/app/models/openlibrary.py
cp ../../../models/exception.py lambda_package/app/models/exception.py
cp ../../../utils/images/factory.py lambda_package/app/utils/images/factory.py
cp ../../../utils/images/base.py lambda_package/app/utils/images/base.py
cp ../../../utils/images/s3.py lambda_package/app/utils/images/s3.py
cp ../../../utils/images/local.py lambda_package/app/utils/images/local.py

# Install FastAPI and Pydantic
# TODO may need to peg these to versions from requirements.txt?
pip install --target ./lambda_package pydantic
pip install --target ./lambda_package fastapi

# Zip contents
cd lambda_package
zip -r ../microservice.zip .
cd ../

# Push to S3
aws s3 cp microservice.zip s3://alexandria-backend-s3-bucket-lambda-code-production

# Deploy to Lambda
aws lambda update-function-code \
  --function-name alexandria-backend-lambda-function-no-vpc-production \
  --s3-bucket alexandria-backend-s3-bucket-lambda-code-production \
  --s3-key microservice.zip \
  --region 'us-east-1'