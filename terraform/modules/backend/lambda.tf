resource "aws_iam_role" "lambda_exec" {
  name = "${var.app_name}-backend-iam-role-lambda-exec-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    application = var.app_name
    environment = var.environment
  }
}


resource "aws_lambda_function" "lambda_function" {
  function_name = "${var.app_name}-backend-lambda-function-${var.environment}"
  s3_bucket     = "${var.app_name}-backend-s3-bucket-lambda-code-${var.environment}"
  s3_key        = "${var.app_name}.zip"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "main.handler"
  runtime       = "python3.12"
  timeout       = 60

  environment {
    variables = {
      DATABASE_PATH = "/mnt/efs/${var.app_name}.db"
    }
  }

  file_system_config {
    arn               = aws_efs_access_point.efs_access_point.arn
    local_mount_path  = "/mnt/efs"
  }

  tags = {
    application = var.app_name
    environment = var.environment
  }
}