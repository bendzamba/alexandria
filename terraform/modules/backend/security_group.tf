resource "aws_security_group" "efs_sg" {
  vpc_id  = aws_vpc.vpc.id
  name    = "${var.app_name}-backend-security-group-efs-${var.environment}"

  ingress {
    from_port   = 2049
    to_port     = 2049
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_security_group" "lambda_sg" {
  vpc_id  = aws_vpc.vpc.id
  name    = "${var.app_name}-backend-security-group-lambda-${var.environment}"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    application = var.app_name
    environment = var.environment
  }
}
