# This file creates the S3 bucket to host our Lambda function's code
# However, we will not use Terraform to configure our Lambda function to point
# to this bucket, as to do so would require there to be a ZIP file present
# and we don't want to couple this process with building, zipping and pushing
# application files to S3

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "${var.app_name}-backend-s3-bucket-lambda-code-${var.environment}"

  tags = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "s3_bucket_versioning" {
  bucket = aws_s3_bucket.lambda_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}