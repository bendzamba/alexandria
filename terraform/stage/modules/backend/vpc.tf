# The following creates our VPC and related network requirements
# Our Elastic File System needs to live inside of a VPC, thus the requirement
# This necessitates our Lambda function to also live inside of the VPC, unless
# we want to manage VPC Peering Connections. Unnecessary, no real upside
# For our Lambda to access the internet, we need the Internet and Nat Gateways
# Creating a separate version of any of this for different 'stages' of the
# application is wholly unnecessary, thus there is no mention below of 'environment'

resource "aws_vpc" "vpc" {
  cidr_block  = "10.0.0.0/16"
  tags        = {
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
  availability_zone = "us-east-1a"
  tags              = {
    application = var.app_name
    Name        = "${var.app_name}-backend-private-subnet-lambda-2"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id            = aws_vpc.vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"
  tags              = {
    application = var.app_name
    Name        = "${var.app_name}-backend-public-subnet-lambda"
  }
}

resource "aws_internet_gateway" "internet_gateway" {
  vpc_id  = aws_vpc.vpc.id
  tags    = {
    application = var.app_name
    Name        = "${var.app_name}-backend-internet-gateway"
  }
}

resource "aws_network_interface" "network_interface" {
  subnet_id   = aws_subnet.public_subnet.id
  private_ips = ["10.0.2.56"]
  tags        = {
    application = var.app_name
    Name        = "${var.app_name}-backend-eni"
  }
}

resource "aws_eip" "nat_gateway_eip" {
  domain            = "vpc"
  tags = {
    application = var.app_name
    Name        = "${var.app_name}-backend-elastic-ip"
  }
}

resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.nat_gateway_eip.id
  subnet_id     = aws_subnet.public_subnet.id
  tags          = {
    application = var.app_name
    Name        = "${var.app_name}-backend-nat-gateway"
  }

  # To ensure proper ordering, it is recommended to add an explicit dependency
  # on the Internet Gateway for the VPC.
  depends_on    = [aws_internet_gateway.internet_gateway]
}

resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.vpc.id
  tags = {
    Name        = "${var.app_name}-backend-private-route-table"
    application = var.app_name
  }
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_nat_gateway.nat_gateway.id
  }
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.vpc.id
  tags = {
    Name        = "${var.app_name}-backend-public-route-table"
    application = var.app_name
  }
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway.id
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