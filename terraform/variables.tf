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

variable "route53_zone_id" {
  type    = string
  default = aws_route53_zone.route53_zone.id
}