resource "aws_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_subnet" "subnet_1" {
  vpc_id     = aws_vpc.vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_subnet" "subnet_2" {
  vpc_id     = aws_vpc.vpc.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "us-east-1b"

  tags = {
    application = var.app_name
    environment = var.environment
  }
}
