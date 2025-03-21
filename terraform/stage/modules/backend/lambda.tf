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
      },
      {
        Effect   = "Allow"
        Action   = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "arn:aws:s3:::${aws_s3_bucket.images_bucket.bucket}/*"  # The bucket you're writing to
      }
    ] 
  })
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_policy_attachment" {
  role        = aws_iam_role.lambda_exec.name
  policy_arn  = aws_iam_policy.lambda_vpc_policy.arn
}

# Inline template for the lambda function
data "template_file" "lambda_code" {
  template = <<-EOT
    def handler(event, context):
        return {
            'statusCode': 200,
            'body': 'Hello, World!'
        }
  EOT
}

# Create a temporary file with the rendered template content
resource "local_file" "lambda_code" {
  content  = data.template_file.lambda_code.rendered
  filename = "${path.module}/lambda.py"
}

# Create the archive from the template
data "archive_file" "lambda_zip" {
  type            = "zip"
  source_file     = local_file.lambda_code.filename
  output_path     = "${path.module}/lambda.zip"
}

resource "aws_lambda_function" "lambda_function" {
  function_name = "${var.app_name}-backend-lambda-function-${var.environment}"
  filename      = data.archive_file.lambda_zip.output_path
  role          = aws_iam_role.lambda_exec.arn
  handler       = "app.main.handler"
  runtime       = "python3.12"
  timeout       = 60

  # For our initial Lambda creation, we need to include our temporary file
  # However, when updates run, we don't want Terraform to manage the filename
  # because elsewhere in our CICD pipeline we are updating our Lambda function
  # to fetch our packaged, production code from S3
  lifecycle {
    ignore_changes = [
      filename
    ]
  }

  environment {
    variables = {
      DATABASE_URL                  = "sqlite:////mnt/lambda/${var.app_name}.db",
      LOCAL_IMAGE_DIRECTORY         = "/tmp",
      S3_IMAGE_BUCKET               = aws_s3_bucket.images_bucket.bucket,
      STORAGE_BACKEND               = "s3"
      NON_VPC_LAMBDA_FUNCTION_NAME  = "${var.app_name}-backend-lambda-function-no-vpc-${var.environment}"
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

  depends_on = [
    aws_efs_mount_target.efs_mount_target_1,
    aws_efs_mount_target.efs_mount_target_2,
    aws_iam_role_policy_attachment.lambda_vpc_policy_attachment
  ]

  tags = {
    application = var.app_name
    environment = var.environment
  }
}

# TODO - is this used??
resource "aws_lambda_permission" "apigateway_invoke_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_function.function_name
  principal     = "apigateway.amazonaws.com"

  # This gives permission to the specific API Gateway to invoke the Lambda
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.api_gateway_rest_api.id}/*/*/${aws_api_gateway_resource.api_gateway_resource.path_part}"
}

resource "aws_iam_policy" "lambda_invoke_policy" {
  name   = "${var.app_name}-lambda-invoke-policy-${var.environment}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Action    = "lambda:InvokeFunction"
        Resource  = "arn:aws:lambda:${var.region}:${data.aws_caller_identity.current.account_id}:function:${aws_lambda_function.lambda_function.function_name}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_invoke_policy_attachment" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_invoke_policy.arn

  depends_on = [aws_lambda_function.lambda_function]
}

# This separate Lambda function needs to reside outside of our VPC for internet access
# The role and environment variables vary slightly
# Our main Lambda function will call this one via the AWS SDK

resource "aws_iam_role" "lambda_exec_no_vpc" {
  name = "${var.app_name}-backend-iam-role-lambda-exec-no-vpc-${var.environment}"

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

resource "aws_iam_policy" "lambda_no_vpc_policy" {
  name    = "${var.app_name}-backend-lambda-iam-policy-no-vpc-${var.environment}"
  policy  = jsonencode({
    Version = "2012-10-17"
    Statement = [
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
        Effect   = "Allow"
        Action   = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "arn:aws:s3:::${aws_s3_bucket.images_bucket.bucket}/*"
      }
    ] 
  })
}

resource "aws_iam_role_policy_attachment" "lambda_no_vpc_policy_attachment" {
  role        = aws_iam_role.lambda_exec_no_vpc.name
  policy_arn  = aws_iam_policy.lambda_no_vpc_policy.arn
}

resource "aws_lambda_function" "lambda_function_no_vpc" {
  function_name = "${var.app_name}-backend-lambda-function-no-vpc-${var.environment}"
  filename      = data.archive_file.lambda_zip.output_path
  role          = aws_iam_role.lambda_exec_no_vpc.arn
  handler       = "app.main.handler"
  runtime       = "python3.12"
  timeout       = 60

  # For our initial Lambda creation, we need to include our temporary file
  # However, when updates run, we don't want Terraform to manage the filename
  # because elsewhere in our CICD pipeline we are updating our Lambda function
  # to fetch our packaged, production code from S3
  lifecycle {
    ignore_changes = [
      filename
    ]
  }

  environment {
    variables = {
      DATABASE_URL          = "sqlite://", # In-memory DB
      LOCAL_IMAGE_DIRECTORY = "/tmp",
      S3_IMAGE_BUCKET       = aws_s3_bucket.images_bucket.bucket,
      STORAGE_BACKEND       = "s3"
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_no_vpc_policy_attachment
  ]

  tags = {
    application = var.app_name
    environment = var.environment
  }
}


# Allow our main Lambda to invoke our non-VPC Lambda
resource "aws_iam_policy" "lambda_no_vpc_invoke_policy" {
  name   = "${var.app_name}-lambda-no-vpc-invoke-policy-${var.environment}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Action    = "lambda:InvokeFunction"
        Resource  = "arn:aws:lambda:${var.region}:${data.aws_caller_identity.current.account_id}:function:${aws_lambda_function.lambda_function_no_vpc.function_name}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_no_vpc_invoke_policy_attachment" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_no_vpc_invoke_policy.arn

  depends_on = [aws_lambda_function.lambda_function_no_vpc]
}