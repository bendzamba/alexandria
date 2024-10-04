# This file creates the 'backend' for our main infrastructure
# An S3 bucket and Dynamo table are created to store the terraform state for the rest of our infrastructure
# This config's 'backend' is itself! Only after initial creation of course.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.66"
    }
  }

  required_version = ">= 1.9.5"

  # Uncomment this once your bucket and dynamo table have been created
  # Variables are not allowed here, so swap out the placeholders
  # This allows our 'backend' to use itself as its own backend
  # backend "s3" {
  #   bucket         = "<APP_NANE>-terraform-backend-s3-bucket"
  #   key            = "backend/terraform.tfstate"
  #   region         = "<REGION>"
  #   dynamodb_table = "<APP_NANE>-terraform-backend-dynamo-lock-table"
  # }  
}

provider "aws" {
  region  = var.region
  profile = "terraform-alexandria"
}

resource "aws_s3_bucket" "terraform_backend_s3_bucket" {
  bucket = "${var.app_name}-terraform-backend-s3-bucket"

  tags = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "terraform_state_bucket_versioning" {
  bucket = aws_s3_bucket.terraform_backend_s3_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_dynamodb_table" "terraform_backend_dynamo_lock_table" {
  name          = "${var.app_name}-terraform-backend-dynamo-lock-table"
  billing_mode  = "PAY_PER_REQUEST"
  hash_key      = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    application = var.app_name
    environment = var.environment
  }
}
