# We have separately created an S3 bucket to house this Lambda function's code
# However, we will not link the two via Terraform as that requires a ZIP file
# to exist in S3
# Rather, the updating of the lambda function via CLI when we are pushing a code
# change, will instruct the Lambda to fetch the code from S3

data "aws_caller_identity" "current" {}

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

resource "aws_iam_policy" "lambda_vpc_policy" {
  name    = "${var.app_name}-backend-iam-policy-vpc-${var.environment}"
  policy  = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses"
        ]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = "ec2:DescribeSecurityGroups"
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = "ec2:DescribeSubnets"
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = "ec2:DescribeVpcs"
        Resource = "*"
      },
      {
        Effect    = "Allow"
        Action    = "lambda:InvokeFunction"
        Resource  = "arn:aws:lambda:${var.region}:${data.aws_caller_identity.current.account_id}:function:${aws_lambda_function.lambda_function.function_name}"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "elasticfilesystem:ClientMount",
          "elasticfilesystem:ClientRootAccess",
          "elasticfilesystem:ClientWrite",
          "elasticfilesystem:DescribeMountTargets"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DescribeSubnets",
          "ec2:DeleteNetworkInterface",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses"
        ],
        Resource = "*"
      }
    ] 
  })
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_policy_attachment" {
  role        = aws_iam_role.lambda_exec.name
  policy_arn  = aws_iam_policy.lambda_vpc_policy.arn
}


resource "aws_lambda_function" "lambda_function" {
  function_name = "${var.app_name}-backend-lambda-function-${var.environment}"
  s3_bucket     = "${var.app_name}-backend-s3-bucket-lambda-code-${var.environment}"
  s3_key        = "${var.app_name}.zip"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "app.main.handler"
  runtime       = "python3.12"
  timeout       = 60

  environment {
    variables = {
      DATABASE_URL = "/mnt/efs/${var.app_name}.db"
    }
  }

  file_system_config {
    arn               = aws_efs_access_point.efs_access_point.arn
    local_mount_path  = "/mnt/lambda"
  }

  vpc_config {
    subnet_ids         = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
    security_group_ids = [aws_security_group.lambda_security_group.id]
  }

  depends_on = [ aws_efs_mount_target.efs_mount_target_1, aws_efs_mount_target.efs_mount_target_2 ]

  tags = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_lambda_permission" "apigateway_invoke_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_function.function_name
  principal     = "apigateway.amazonaws.com"

  # This gives permission to the specific API Gateway to invoke the Lambda
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.api_gateway_res_api.id}/*/ANY/${aws_api_gateway_resource.api_gateway_resource.path_part}"
}