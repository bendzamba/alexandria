# The following creates our VPC and related network requirements
# Our Elastic File System needs to live inside of a VPC, thus the requirement
# This necessitates our Lambda function to also live inside of the VPC
# For our Lambda to access the internet, we rely on our separate 'microservice'
# Lambda that lives outside of our VPC
# Creating a separate version of any of this for different 'stages' of the
# application is wholly unnecessary, thus there is no mention below of 'environment'

resource "aws_vpc" "vpc" {
  cidr_block            = "10.0.0.0/16"
  enable_dns_support    = true
  enable_dns_hostnames  = true
  tags                  = {
    application = var.app_name
    Name        = "${var.app_name}-backend-vpc"
  }
}

resource "aws_subnet" "private_subnet_1" {
  vpc_id            = aws_vpc.vpc.id
  cidr_block        = "10.0.0.0/24"
  availability_zone = "us-east-1a"
  tags              = {
    application = var.app_name
    Name        = "${var.app_name}-backend-private-subnet-lambda-1"
  }
}

resource "aws_subnet" "private_subnet_2" {
  vpc_id            = aws_vpc.vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1b"
  tags              = {
    application = var.app_name
    Name        = "${var.app_name}-backend-private-subnet-lambda-2"
  }
}

resource "aws_security_group" "efs_security_group" {
  vpc_id  = aws_vpc.vpc.id
  name    = "${var.app_name}-backend-security-group-efs"
  tags    = {
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
  security_group_id             = aws_security_group.efs_security_group.id
  referenced_security_group_id  = aws_security_group.lambda_security_group.id
  from_port                     = 2049
  to_port                       = 2049
  ip_protocol                   = "tcp"
}

resource "aws_security_group" "lambda_security_group" {
  vpc_id  = aws_vpc.vpc.id
  name    = "${var.app_name}-backend-security-group-lambda"
  tags    = {
    application = var.app_name
    Name        = "${var.app_name}-backend-security-group-lambda"
  }
}

resource "aws_vpc_security_group_egress_rule" "lambda_security_group_egress" {
  security_group_id = aws_security_group.lambda_security_group.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}

resource "aws_vpc_endpoint" "lambda_endpoint" {
  vpc_id              = aws_vpc.vpc.id
  service_name        = "com.amazonaws.${var.region}.lambda"
  vpc_endpoint_type   = "Interface"

  subnet_ids          = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
  security_group_ids  = [aws_security_group.lambda_security_group.id]

  private_dns_enabled = true

  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-vpc-endpoint-lambda"
  }
}