variable "app_name" {
  type = string
}

variable "app_domain" {
  type = string
}

variable "environment" {
  type = string
}

variable "production_certificate_arn" {
  type = string
}

variable "stage_certificate_arn" {
  type = string
}

variable "domain_prefix" {
  type = string
}

variable "route53_zone_id" {
  type = string
}

variable "region" {
  type = string
}