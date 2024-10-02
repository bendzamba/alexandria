resource "aws_s3_bucket" "frontend_s3_bucket" {
  bucket = "${var.app_name}-frontend-s3-bucket-${var.environment}"

  tags = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "s3_lambda_bucket_versioning" {
  bucket = aws_s3_bucket.frontend_s3_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_policy" "s3_bucket_policy" {
  bucket = aws_s3_bucket.frontend_s3_bucket.id
  policy = data.aws_iam_policy_document.iam_policy_document.json
}