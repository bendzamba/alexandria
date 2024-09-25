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

module "base" {
  source      = "./modules/base"
  app_name    = var.app_name
  app_domain  = var.app_domain
}

module "frontend" {
  source                      = "./modules/frontend"
  app_name                    = var.app_name
  app_domain                  = var.app_domain
  environment                 = var.environment
  route53_zone_id             = data.aws_route53_zone.route53_zone.zone_id
  production_certificate_arn  = module.base.acm_certificate_production.arn
  stage_certificate_arn       = module.base.acm_certificate_stage.arn
  domain_prefix               = var.domain_prefix
  depends_on                  = [ 
    module.base.aws_acm_certificate_production,
    module.base.aws_acm_certificate_validation_production,
    module.base.aws_acm_certificate_stage,
    module.base.aws_acm_certificate_validation_stage,
  ]
}

module "backend" {
  source                      = "./modules/backend"
  app_name                    = var.app_name
  app_domain                  = var.app_domain
  environment                 = var.environment
  route53_zone_id             = data.aws_route53_zone.route53_zone.zone_id
  region                      = var.region
  production_certificate_arn  = module.base.acm_certificate_production.arn
  stage_certificate_arn       = module.base.acm_certificate_stage.arn
  domain_prefix               = var.domain_prefix
  depends_on                  = [ 
    module.base.aws_acm_certificate_production,
    module.base.aws_acm_certificate_validation_production,
    module.base.aws_acm_certificate_stage,
    module.base.aws_acm_certificate_validation_stage,
  ]
}