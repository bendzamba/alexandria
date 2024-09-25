# This file is responsible for bootstrapping all resources that are not 'stage specific'
# Meaning, we don't want to or need to re-create these resources for various versions of the
# application we might test, including production, staging, or some new feature
# These can be created one time and then left alone unless we want to tear everything down


# The following creates our VPC and related network requirements
# Our Elastic File System needs to live inside of a VPC, thus the requirement
# This necessitates our Lambda function to also live inside of the VPC, unless
# we want to manage VPC Peering Connections. Unnecessary, no real upside
# For our Lambda to access the internet, we need the Internet and Nat Gateways
# Creating a separate version of any of this for different 'stages' of the
# application is wholly unnecessary

resource "aws_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-vpc"
  }
}

resource "aws_subnet" "private_subnet_1" {
  vpc_id     = aws_vpc.vpc.id
  cidr_block = "10.0.0.0/24"
  availability_zone = "us-east-1a"

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-private-subnet-lambda-1"
  }
}

resource "aws_subnet" "private_subnet_2" {
  vpc_id     = aws_vpc.vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-private-subnet-lambda-2"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id     = aws_vpc.vpc.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "us-east-1b"

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-public-subnet-lambda"
  }
}

resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-internet-gateway"
  }
}

resource "aws_network_interface" "network_interface" {
  subnet_id   = aws_subnet.public_subnet.id
  private_ips = ["10.0.2.56"]

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-eni"
  }
}

resource "aws_eip" "eip" {
  domain            = "vpc"
  network_interface = aws_network_interface.network_interface.id

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-elastic-ip"
  }
}

resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.eip.id
  subnet_id     = aws_subnet.public_subnet.id

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-nat-gateway"
  }

  # To ensure proper ordering, it is recommended to add an explicit dependency
  # on the Internet Gateway for the VPC.
  depends_on = [aws_internet_gateway.internet_gateway]
}

resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "10.0.0.0/16"
    gateway_id = aws_nat_gateway.nat_gateway.id
  }

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "local"
  }

  tags = {
    Name        = "${var.app_name}-backend-private-route-table"
    application = var.app_name
  }
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "10.0.0.0/16"
    gateway_id = aws_internet_gateway.internet_gateway.id
  }

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "local"
  }

  tags = {
    Name        = "${var.app_name}-backend-public-route-table"
    application = var.app_name
  }
}

resource "aws_route_table_association" "private_route_table_association_1" {
  subnet_id      = aws_subnet.private_subnet_1.id
  route_table_id = aws_route_table.private_route_table.id
}

resource "aws_route_table_association" "private_route_table_association_2" {
  subnet_id      = aws_subnet.private_subnet_2.id
  route_table_id = aws_route_table.private_route_table.id
}

resource "aws_route_table_association" "public_route_table_association" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_security_group" "efs_security_group" {
  vpc_id  = aws_vpc.vpc.id
  name    = "${var.app_name}-backend-security-group-efs"

  ingress {
    from_port   = 2049
    to_port     = 2049
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-security-group-efs"
  }
}

resource "aws_vpc_security_group_egress_rule" "efs_security_group_egress" {
  security_group_id = aws_security_group.efs_security_group.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}

resource "aws_vpc_security_group_ingress_rule" "efs_security_group_ingress" {
  security_group_id             = aws_security_group.lambda_security_group.id
  referenced_security_group_id  = aws_security_group.lambda_security_group.id
  from_port                     = 2049
  ip_protocol                   = "tcp"
  to_port                       = 2049
}

resource "aws_security_group" "lambda_security_group" {
  vpc_id  = aws_vpc.vpc.id
  name    = "${var.app_name}-backend-security-group-lambda"

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-security-group-lambda"
  }
}

resource "aws_vpc_security_group_egress_rule" "lambda_security_group_egress" {
  security_group_id = aws_security_group.lambda_security_group.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}


# The following creates our Elastic File System
# While we could create a new one per application stage, this is unnecessary
# A single EFS can house as many stage-specific SQLite DB files as we need

resource "aws_efs_file_system" "efs_file_system" {
  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }
  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-efs-file-system"
  }
}

resource "aws_efs_access_point" "efs_access_point" {
  file_system_id = aws_efs_file_system.efs_file_system.id

  posix_user {
    uid = 1000
    gid = 1000
  }

  root_directory {
    path = "/lambda"
    creation_info {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "0777"
    }
  }

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-efs-access-point"
  }
}

resource "aws_efs_mount_target" "efs_mount_target_1" {
  file_system_id  = aws_efs_file_system.efs_file_system.id
  subnet_id       = aws_subnet.public_subnet.id
  security_groups = [aws_security_group.efs_security_group.id]
}

resource "aws_efs_mount_target" "efs_mount_target_2" {
  file_system_id  = aws_efs_file_system.efs_file_system.id
  subnet_id       = aws_subnet.private_subnet_1.id
  security_groups = [aws_security_group.efs_security_group.id]
}


# The following creates our ACM Certificates
# This naturally requires our Route53 Zone to already exist, which
# should have been created earlier with our DNS directory files
# I believe this should cover us for production, staging, and any
# other code versions we may want to deploy
# These can all live in the same hosted zone for our Root Domain

data "aws_route53_zone" "route53_zone" {
  zone_id = "Z03068893L6HPT1E8HOW" # Taken from results of DNS directory terraform creation
}

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