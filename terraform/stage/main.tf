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
  certificate_arn             = aws_acm_certificate.acm_certificate_frontend.arn
  domain_prefix               = local.domain_prefix
  depends_on                  = [ 
    aws_acm_certificate.acm_certificate_frontend,
    aws_acm_certificate_validation.acm_certificate_validation_frontend
  ]
}

module "backend" {
  source                      = "./modules/backend"
  app_name                    = var.app_name
  app_domain                  = var.app_domain
  environment                 = var.environment
  route53_zone_id             = data.aws_route53_zone.route53_zone.zone_id
  region                      = var.region
  certificate_arn             = aws_acm_certificate.acm_certificate_backend.arn
  domain_prefix               = local.domain_prefix
  efs_datasync_schedule       = var.efs_datasync_schedule
  depends_on                  = [ 
    aws_acm_certificate.acm_certificate_backend,
    aws_acm_certificate_validation.acm_certificate_validation_backend,
  ]
}


# The following creates our ACM Certificates
# This naturally requires our Route53 Zone to already exist, which
# should have been created earlier with our DNS directory files
# I believe this should cover us for production, staging, and any
# other code versions we may want to deploy
# These can all live in the same hosted zone for our Root Domain
# These are also required by both our frontend and backend components

# This covers our frontend needs, meaning <ROOT DOMAIN>, www.<ROOT DOMAIN>, and <stage>.<ROOT DOMAIN>

resource "aws_acm_certificate" "acm_certificate_frontend" {
  domain_name               = "${var.app_domain}"
  validation_method         = "DNS"
  subject_alternative_names = [
    "*.${var.app_domain}"
  ]

  tags = {
    application = var.app_name
  }
}

resource "aws_route53_record" "route53_records_frontend" {
  for_each = {
    for dvo in aws_acm_certificate.acm_certificate_frontend.domain_validation_options : dvo.domain_name => {
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

resource "aws_acm_certificate_validation" "acm_certificate_validation_frontend" {
  certificate_arn         = aws_acm_certificate.acm_certificate_frontend.arn
  validation_record_fqdns = [for record in aws_route53_record.route53_records_frontend : record.fqdn]
}

# This covers our backend needs, meaning api.<ROOT DOMAIN> and <stage>.api.<ROOT DOMAIN>

resource "aws_acm_certificate" "acm_certificate_backend" {
  domain_name               = "api.${var.app_domain}"
  validation_method         = "DNS"
  subject_alternative_names = [
    "*.api.${var.app_domain}"
  ]

  tags = {
    application = var.app_name
  }
}

resource "aws_route53_record" "route53_records_backend" {
  for_each = {
    for dvo in aws_acm_certificate.acm_certificate_backend.domain_validation_options : dvo.domain_name => {
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

resource "aws_acm_certificate_validation" "acm_certificate_validation_backend" {
  certificate_arn         = aws_acm_certificate.acm_certificate_backend.arn
  validation_record_fqdns = [for record in aws_route53_record.route53_records_backend : record.fqdn]
}