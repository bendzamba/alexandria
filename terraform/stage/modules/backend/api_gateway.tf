resource "aws_api_gateway_rest_api" "api_gateway_rest_api" {
  name = "${var.app_name}-backend-api-gateway-api-${var.environment}"
  binary_media_types = ["multipart/form-data"]
  tags = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_api_gateway_resource" "api_gateway_resource" {
  rest_api_id = aws_api_gateway_rest_api.api_gateway_rest_api.id
  parent_id   = aws_api_gateway_rest_api.api_gateway_rest_api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "api_gateway_any_method" {
  rest_api_id   = aws_api_gateway_rest_api.api_gateway_rest_api.id
  resource_id   = aws_api_gateway_resource.api_gateway_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "api_gateway_integration" {
  rest_api_id             = aws_api_gateway_rest_api.api_gateway_rest_api.id
  resource_id             = aws_api_gateway_resource.api_gateway_resource.id
  http_method             = aws_api_gateway_method.api_gateway_any_method.http_method
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda_function.invoke_arn
  integration_http_method = "POST"
}

resource "aws_api_gateway_method_settings" "api_gateway_method_settings" {
  rest_api_id = aws_api_gateway_rest_api.api_gateway_rest_api.id
  stage_name  = aws_api_gateway_stage.api_gateway_stage.stage_name
  method_path = "*/*"
  settings {
    logging_level = "INFO"
    data_trace_enabled = true
    metrics_enabled = true
  }
}

# If we are in production, the 'stage' is not explicit, meaning we don't want
# production.api.myalexandria.ai
# var.domain_prefix is either a stage subdomain with '.' or an empty string, in the case of production
resource "aws_route53_record" "api_gateway_a_record" {
  name    = "${var.domain_prefix}api.${var.app_domain}"
  type    = "A"
  zone_id = var.route53_zone_id

  alias {
    evaluate_target_health  = false
    zone_id                 = aws_api_gateway_domain_name.api_gateway_custom_domain.regional_zone_id
    name                    = aws_api_gateway_domain_name.api_gateway_custom_domain.regional_domain_name
  }
}

# If we are in production, the 'stage' is not explicit, meaning we don't want
# production.api.<domain>
# var.domain_prefix is either a stage subdomain with '.' or an empty string, in the case of production
# The certificate we need has been determined upstream
resource "aws_api_gateway_domain_name" "api_gateway_custom_domain" {
  domain_name               = "${var.domain_prefix}api.${var.app_domain}"
  regional_certificate_arn  = var.certificate_arn
  tags                      = {
    application = var.app_name
    environment = var.environment
  }
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_base_path_mapping" "api_gateway_base_path_mapping" {
  api_id      = aws_api_gateway_rest_api.api_gateway_rest_api.id
  stage_name  = aws_api_gateway_stage.api_gateway_stage.stage_name
  domain_name = aws_api_gateway_domain_name.api_gateway_custom_domain.domain_name
}

# Create IAM Role for API Gateway to access CloudWatch Logs
resource "aws_iam_role" "api_gateway_cloudwatch_role" {
  name                = "APIGatewayCloudWatchLogsRole"
  assume_role_policy  = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action    = "sts:AssumeRole",
        Effect    = "Allow",
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

# Create a policy that allows API Gateway to interact with CloudWatch Logs
resource "aws_iam_policy" "api_gateway_cloudwatch_policy" {
  name    = "APIGatewayCloudWatchLogsPolicy"
  policy  = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action   = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ],
        Effect   = "Allow",
        Resource = "*"
      }
    ]
  })
}

# Attach the policy to the IAM Role
resource "aws_iam_role_policy_attachment" "attach_api_gateway_cloudwatch_policy" {
  role       = aws_iam_role.api_gateway_cloudwatch_role.name
  policy_arn = aws_iam_policy.api_gateway_cloudwatch_policy.arn
}

# Assign the IAM Role to API Gateway Account
resource "aws_api_gateway_account" "api_gateway_account" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch_role.arn

  depends_on = [
    aws_iam_role.api_gateway_cloudwatch_role,
    aws_iam_policy.api_gateway_cloudwatch_policy,
    aws_iam_role_policy_attachment.attach_api_gateway_cloudwatch_policy
  ]
}

# CORS
resource "aws_api_gateway_method" "api_gateway_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.api_gateway_rest_api.id
  resource_id   = aws_api_gateway_resource.api_gateway_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "cors_integration" {
  rest_api_id             = aws_api_gateway_rest_api.api_gateway_rest_api.id
  resource_id             = aws_api_gateway_resource.api_gateway_resource.id
  http_method             = aws_api_gateway_method.api_gateway_options_method.http_method
  type                    = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
  depends_on              = [aws_api_gateway_method.api_gateway_options_method]
}

resource "aws_api_gateway_integration_response" "cors_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.api_gateway_rest_api.id
  resource_id = aws_api_gateway_resource.api_gateway_resource.id
  http_method = aws_api_gateway_method.api_gateway_options_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'"
    "method.response.header.Access-Control-Allow-Methods" = "'DELETE, GET, HEAD, OPTIONS, PATCH, POST'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [
    aws_api_gateway_method.api_gateway_options_method,
    aws_api_gateway_integration.cors_integration
  ]
}

resource "aws_api_gateway_method_response" "api_gateway_options_method_response" {
  rest_api_id         = aws_api_gateway_rest_api.api_gateway_rest_api.id
  resource_id         = aws_api_gateway_resource.api_gateway_resource.id
  http_method         = aws_api_gateway_method.api_gateway_options_method.http_method
  status_code         = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
  response_models = {
    "application/json" = "Empty"
  }
  depends_on          = [aws_api_gateway_method.api_gateway_options_method]
}

# Deployment
resource "aws_api_gateway_deployment" "api_gateway_deployment" {
  depends_on  = [
    aws_api_gateway_integration.api_gateway_integration,
    aws_api_gateway_integration.cors_integration,
    aws_api_gateway_method.api_gateway_any_method,
    aws_api_gateway_method.api_gateway_options_method
    ]
  rest_api_id = aws_api_gateway_rest_api.api_gateway_rest_api.id
  # This forces a new deployment when the API Gateway configuration changes
  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.api_gateway_rest_api))
  }
  # Ensures there’s no downtime when redeploying.
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "api_gateway_stage" {
  deployment_id = aws_api_gateway_deployment.api_gateway_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.api_gateway_rest_api.id
  stage_name    = var.environment
  tags          = {
    application = var.app_name
    environment = var.environment
  }
}