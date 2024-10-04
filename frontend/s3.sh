#!/bin/bash

# Step 1: Package the application
npm run build

# Step 2: Deploy to S3
aws s3 sync ./build s3://alexandria-frontend-s3-bucket-production --delete