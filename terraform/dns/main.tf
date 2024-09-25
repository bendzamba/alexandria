# This file creates the Route53 Hosted Zone for our domain
# This is required so we can point our domain's NameServers at AWS, which in turn allows us 
# to validate our certificates using DNS
# Basically, this is an initial step that should be taken prior to creating the rest
# of our infrastructure

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
  #   key            = "dns/terraform.tfstate"
  #   region         = "<REGION>"
  #   dynamodb_table = "<APP_NANE>-terraform-backend-dynamo-lock-table"
  # }
}

provider "aws" {
  region  = var.region
  profile = "terraform-alexandria"
}

resource "aws_route53_zone" "route53_zone" {
  name = var.app_domain

  tags = {
    application = var.app_name
    environment = var.environment
  }
}