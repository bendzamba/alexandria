# Naming conventions:
# AWS Resource: {app}-{component}-{aws service}-{aws resource type}-{environment}
# Terraform: {app}_{component}_{aws service}_{aws resource type}_{environment}
# Where:
# {app} = alexandria
# {component} = backend|frontend
# {aws service} = lambda|s3|api gateway|etc...
# {aws resource type} = function|bucket|api|etc...
# {environment} = staging|production|etc...
# Examples:
# AWS: alexandria-backend-lambda-function-production
# Terraform: alexandria_backend_lambda_function_production

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
    key            = "main/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "alexandria-terraform-backend-dynamo-lock-table-production"
  }
}

provider "aws" {
  region  = var.region
  profile = "terraform-alexandria"
}

module "frontend" {
  source          = "./modules/frontend"
  app_name        = var.app_name
  app_domain      = var.app_domain
  environment     = var.environment
  route53_zone_id = aws_route53_zone.route53_zone.id
  certificate_arn = aws_acm_certificate.acm_certificate.arn
}

module "backend" {
  source          = "./modules/backend"
  app_name        = var.app_name
  app_domain      = var.app_domain
  environment     = var.environment
  route53_zone_id = aws_route53_zone.route53_zone.id
  certificate_arn = aws_acm_certificate.acm_certificate.arn
}

resource "aws_acm_certificate" "acm_certificate" {
  domain_name       = var.app_domain
  validation_method = "DNS"

  tags = {
    application = var.app_name
    environment = var.environment
  }
}

data "aws_route53_zone" "route53_zone" {
  id = "Z03068893L6HPT1E8HOW" # Taken from separate dns_setup results
}

resource "aws_route53_record" "route53_record" {
  for_each = {
    for dvo in aws_acm_certificate.acm_certificate.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.route53_zone.zone_id
}

resource "aws_acm_certificate_validation" "acm_certificate_validation" {
  certificate_arn         = aws_acm_certificate.acm_certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.route53_record : record.fqdn]
}