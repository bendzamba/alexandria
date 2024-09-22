resource "aws_security_group" "efs_security_group" {
  vpc_id  = aws_vpc.vpc.id
  name    = "${var.app_name}-backend-security-group-efs-${var.environment}"

  ingress {
    from_port   = 2049
    to_port     = 2049
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  tags = {
    application = var.app_name
    environment = var.environment
    Name        = "${var.app_name}-backend-security-group-efs-${var.environment}"
  }
}

resource "aws_vpc_security_group_egress_rule" "efs_security_group_egress" {
  security_group_id = aws_security_group.efs_security_group.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}

resource "aws_vpc_security_group_ingress_rule" "efs_security_group_ingress" {
  security_group_id = aws_security_group.lambda_security_group.id
  from_port         = 2049
  ip_protocol       = "tcp"
  to_port           = 2049
}

resource "aws_security_group" "lambda_security_group" {
  vpc_id  = aws_vpc.vpc.id
  name    = "${var.app_name}-backend-security-group-lambda-${var.environment}"

  tags = {
    application = var.app_name
    environment = var.environment
    Name        = "${var.app_name}-backend-security-group-lambda-${var.environment}"
  }
}

resource "aws_vpc_security_group_egress_rule" "lambda_security_group_egress" {
  security_group_id = aws_security_group.lambda_security_group.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}