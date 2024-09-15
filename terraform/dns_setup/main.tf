# This file creates the Route53 Hosted Zone for our domain
# This is required so we can point our domain's NameServers at AWS
# which in turn allows us to validate our certificate using DNS

variable "app_name" {
  type    = string
  default = "alexandria"
}

variable "app_domain" {
  type    = string
  default = "myalexandria.ai"
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
    key            = "dns_setup/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "alexandria-terraform-backend-dynamo-lock-table-production"
  }
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