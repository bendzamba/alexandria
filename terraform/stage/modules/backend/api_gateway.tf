resource "aws_api_gateway_rest_api" "api_gateway_rest_api" {
  name = "${var.app_name}-backend-api-gateway-api-${var.environment}"
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

resource "aws_api_gateway_deployment" "api_gateway_deployment" {
  depends_on  = [aws_api_gateway_integration.api_gateway_integration]
  rest_api_id = aws_api_gateway_rest_api.api_gateway_rest_api.id
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

# If we are in production, the 'stage' is not explicit, meaning we don't want
# production.api.myalexandria.ai
# var.domain_prefix is either a stage subdomain with '.' or an empty string, in the case of production
resource "aws_route53_record" "api_gateway_cname_record" {
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
# Similarly, we need the stage certificate if not in production, which covers *.api.<domain>, and the 
# production certificate if in production, which covers *.<domain>, which includes api.<domain>
resource "aws_api_gateway_domain_name" "api_gateway_custom_domain" {
  domain_name               = "${var.domain_prefix}api.${var.app_domain}"
  regional_certificate_arn  = var.environment == "production" ? var.production_certificate_arn : var.stage_certificate_arn
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
          "logs:PutLogEvents"
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
}

resource "aws_api_gateway_method_response" "cors_response" {
  rest_api_id         = aws_api_gateway_rest_api.api_gateway_rest_api.id
  resource_id         = aws_api_gateway_resource.api_gateway_resource.id
  http_method         = "OPTIONS"
  status_code         = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "cors_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.api_gateway_rest_api.id
  resource_id = aws_api_gateway_resource.api_gateway_resource.id
  http_method = "OPTIONS"
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'DELETE, GET, HEAD, OPTIONS, PATCH, POST'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }
}

