variable "app_name" {
  type    = string
  default = "alexandria"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "app_domain" {
  type = string
}

variable "environment" {
  type = string
}

locals {
  # This is significant for getting our stage to be accessible in AWS
  # If we are in production, we want our domains, front and backend, to be 'as-is' with no additional subdomains
  # If we are in a stage we are testing, we want to add the environment as a subdomain
  domain_prefix = var.environment == "production" ? "" : var.environment
}