# The following creates the S3 bucket to host our Lambda function's code
# However, we will not use Terraform to configure our Lambda function to point
# to this bucket, as to do so would require there to be a ZIP file present
# and we don't want to couple this process with building, zipping and pushing
# application files to S3

resource "aws_s3_bucket" "lambda_bucket" {
  bucket        = "${var.app_name}-backend-s3-bucket-lambda-code-${var.environment}"
  force_destroy = true # Deletes all objects in bucket!
  tags          = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "s3_lambda_bucket_versioning" {
  bucket = aws_s3_bucket.lambda_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}


# The following creates the S3 bucket that the backend uses for storing
# and serving static book cover image files that are downloaded from Open Library

resource "aws_s3_bucket" "images_bucket" {
  bucket  = "${var.app_name}-backend-s3-bucket-images-${var.environment}"
  tags    = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "s3_images_bucket_versioning" {
  bucket = aws_s3_bucket.images_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}