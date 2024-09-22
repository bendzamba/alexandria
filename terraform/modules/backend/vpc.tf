resource "aws_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    application = var.app_name
    environment = var.environment
    Name        = "${var.app_name}-backend-vpc-${var.environment}"
  }
}

resource "aws_subnet" "private_subnet_1" {
  vpc_id     = aws_vpc.vpc.id
  cidr_block = "10.0.0.0/24"
  availability_zone = "us-east-1a"

  tags = {
    application = var.app_name
    environment = var.environment
    Name        = "${var.app_name}-backend-private-subnet-lambda-${var.environment}-1"
  }
}

resource "aws_subnet" "private_subnet_2" {
  vpc_id     = aws_vpc.vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    application = var.app_name
    environment = var.environment
    Name        = "${var.app_name}-backend-private-subnet-lambda-${var.environment}-2"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id     = aws_vpc.vpc.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "us-east-1b"

  tags = {
    application = var.app_name
    environment = var.environment
    Name        = "${var.app_name}-backend-public-subnet-lambda-${var.environment}"
  }
}

resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    application = var.app_name
    environment = var.environment
    Name        = "${var.app_name}-backend-internet-gateway-${var.environment}"
  }
}

resource "aws_network_interface" "network_interface" {
  subnet_id   = aws_subnet.public_subnet.id
  private_ips = ["10.0.2.56"]

  tags = {
    application = var.app_name
    environment = var.environment
    Name        = "${var.app_name}-backend-eni-${var.environment}"
  }
}

resource "aws_eip" "eip" {
  domain            = "vpc"
  network_interface = aws_network_interface.network_interface.id

  tags = {
    application = var.app_name
    environment = var.environment
    Name        = "${var.app_name}-backend-elastic-ip-${var.environment}"
  }
}

resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.example.id
  subnet_id     = aws_subnet.public_subnet.id

  tags = {
    application = var.app_name
    environment = var.environment
    Name        = "${var.app_name}-backend-nat-gateway-${var.environment}"
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
    Name        = "${var.app_name}-backend-private-route-table-${var.environment}"
    application = var.app_name
    environment = var.environment
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
    Name        = "${var.app_name}-backend-public-route-table-${var.environment}"
    application = var.app_name
    environment = var.environment
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