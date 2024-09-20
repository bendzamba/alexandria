# This file creates the S3 bucket to host our Lambda function's code
# This is required so we can point our Lambda to the bucket during Lambda creation
# It's possible this step could be absorbed into the main workflow if we tested
# the 'depends on' logic, ensuring our Lambda waits for this step to happen before creating

variable "app_name" {
  type    = string
  default = "alexandria"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.66"
    }
  }

  required_version = ">= 1.9.5"

  backend "s3" {
    bucket         = "alexandria-terraform-backend-s3-bucket-production"
    key            = "lambda_setup/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "alexandria-terraform-backend-dynamo-lock-table-production"
  }
}

provider "aws" {
  region  = var.region
  profile = "terraform-alexandria"
}

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

resource "null_resource" "lambda_zip_upload" {
  provisioner "local-exec" {
    command = <<EOT
      cd venv/lib/python3.12/site-packages
      zip -r9 ../../../../alexandria.zip . &&
      cd ../../../../
      zip -g ./alexandria.zip -r app -x "app/.env" -x "*/__pycache__/*" &&
      aws s3 cp ./alexandria.zip s3://${aws_s3_bucket.lambda_bucket.bucket}/alexandria.zip
    EOT
    working_dir = "${path.module}/../../backend"  # Where your Lambda function code is stored
  }

  depends_on = [aws_s3_bucket.lambda_bucket]
}
