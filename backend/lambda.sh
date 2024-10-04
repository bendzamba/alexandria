#!/bin/bash

APP_NAME=alexandria
DOCKER_CONTAINER_NAME=temp-lambda-packager
DOCKER_IMAGE_NAME=lambda-packager

# Step 1: Build the Docker image
docker build -t $DOCKER_IMAGE_NAME -f Dockerfile.lambda_package .

# Step 2: Remove the container if it exists
docker rm $DOCKER_CONTAINER_NAME

# Step 3: Run the container
docker run --name $DOCKER_CONTAINER_NAME $DOCKER_IMAGE_NAME /bin/true

# Steo 4: Copy the zip file back to host
docker cp $DOCKER_CONTAINER_NAME:/var/task/$APP_NAME.zip ./$APP_NAME.zip

# Step 5: Upload the zip file to S3
aws s3 cp $APP_NAME.zip s3://$APP_NAME-backend-s3-bucket-lambda-code-production

# Step 6: Update the Lambda function from the S3 bucket
aws lambda update-function-code \
  --function-name $APP_NAME-backend-lambda-function-production \
  --s3-bucket $APP_NAME-backend-s3-bucket-lambda-code-production \
  --s3-key $APP_NAME.zip \
  --region 'us-east-1'

echo "Lambda function deployed successfully!"