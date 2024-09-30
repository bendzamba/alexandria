# The resources configured in these modules are stage specific
# Meaning, if we are creating a new stage (testing, feature_a)
# We should run terraform on these files and either swap out the 'stage'
# variable value in terraform.tfvars, or supply the value from the command
# line with -var stage="<stage name"


# Naming conventions for resources:
# {app}-{component}-{aws service}-{aws resource type}-{environment}
# Where:
# {app} = alexandria
# {component} = backend|frontend
# {aws service} = lambda|s3|api gateway|etc...
# {aws resource type} = function|bucket|api|etc...
# {environment} = staging|production|etc...
# Examples:
# AWS: alexandria-backend-lambda-function-production
# If there are cases that fall outside of the structure listed above,
# disgression should be used to align with the spirit of the naming conventions

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.66"
    }
  }

  required_version = ">= 1.9.5"

  backend "s3" {
    bucket         = "alexandria-terraform-backend-s3-bucket"
    key            = "main/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "alexandria-terraform-backend-dynamo-lock-table"
  }
}

provider "aws" {
  region  = var.region
  profile = "terraform-alexandria"
}

data "aws_route53_zone" "route53_zone" {
  zone_id = "Z03068893L6HPT1E8HOW" # Taken from results of DNS directory terraform creation
}

module "frontend" {
  source                      = "./modules/frontend"
  app_name                    = var.app_name
  app_domain                  = var.app_domain
  environment                 = var.environment
  route53_zone_id             = data.aws_route53_zone.route53_zone.zone_id
  production_certificate_arn  = aws_acm_certificate.acm_certificate_production.arn
  stage_certificate_arn       = aws_acm_certificate.acm_certificate_stage.arn
  domain_prefix               = var.domain_prefix
  depends_on                  = [ 
    aws_acm_certificate.acm_certificate_production,
    aws_acm_certificate_validation.acm_certificate_validation_production,
    aws_acm_certificate.acm_certificate_stage,
    aws_acm_certificate_validation.acm_certificate_validation_stage,
  ]
}

module "backend" {
  source                      = "./modules/backend"
  app_name                    = var.app_name
  app_domain                  = var.app_domain
  environment                 = var.environment
  route53_zone_id             = data.aws_route53_zone.route53_zone.zone_id
  region                      = var.region
  production_certificate_arn  = aws_acm_certificate.acm_certificate_production.arn
  stage_certificate_arn       = aws_acm_certificate.acm_certificate_stage.arn
  domain_prefix               = var.domain_prefix
  depends_on                  = [ 
    aws_acm_certificate.acm_certificate_production,
    aws_acm_certificate_validation.acm_certificate_validation_production,
    aws_acm_certificate.acm_certificate_stage,
    aws_acm_certificate_validation.acm_certificate_validation_stage,
  ]
}


# The following creates our ACM Certificates
# This naturally requires our Route53 Zone to already exist, which
# should have been created earlier with our DNS directory files
# I believe this should cover us for production, staging, and any
# other code versions we may want to deploy
# These can all live in the same hosted zone for our Root Domain
# These are also required by both our frontend and backend components

# This covers our Root Domain plus api.<ROOT DOMAIN> for our backend API

resource "aws_acm_certificate" "acm_certificate_production" {
  domain_name               = "${var.app_domain}"
  validation_method         = "DNS"
  subject_alternative_names = [
    "api.${var.app_domain}"
  ]

  tags = {
    application = var.app_name
  }
}

resource "aws_route53_record" "route53_records_production" {
  for_each = {
    for dvo in aws_acm_certificate.acm_certificate_production.domain_validation_options : dvo.domain_name => {
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
  zone_id         = data.aws_route53_zone.route53_zone.zone_id
}

resource "aws_acm_certificate_validation" "acm_certificate_validation_production" {
  certificate_arn         = aws_acm_certificate.acm_certificate_production.arn
  validation_record_fqdns = [for record in aws_route53_record.route53_records_production : record.fqdn]
}

# This covers a wildcard subdomain for our Root Domain such as staging.<ROOT DOMAIN>
# and also staging.api.<ROOT DOMAIN> for our backend API

resource "aws_acm_certificate" "acm_certificate_stage" {
  domain_name               = "*.${var.app_domain}"
  validation_method         = "DNS"
  subject_alternative_names = [
    "*.api.${var.app_domain}"
  ]

  tags = {
    application = var.app_name
  }
}

resource "aws_route53_record" "route53_records_stage" {
  for_each = {
    for dvo in aws_acm_certificate.acm_certificate_stage.domain_validation_options : dvo.domain_name => {
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
  zone_id         = data.aws_route53_zone.route53_zone.zone_id
}

resource "aws_acm_certificate_validation" "acm_certificate_validation_stage" {
  certificate_arn         = aws_acm_certificate.acm_certificate_stage.arn
  validation_record_fqdns = [for record in aws_route53_record.route53_records_stage : record.fqdn]
}