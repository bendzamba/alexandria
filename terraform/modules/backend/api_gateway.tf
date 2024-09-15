resource "aws_api_gateway_rest_api" "api_gateway_res_api" {
  name = "${var.app_name}-backend-api-gateway-api-${var.environment}"

  tags = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_api_gateway_resource" "api_gateway_resource" {
  rest_api_id = aws_api_gateway_rest_api.api_gateway_res_api.id
  parent_id   = aws_api_gateway_rest_api.api_gateway_res_api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "api_gateway_method" {
  rest_api_id   = aws_api_gateway_rest_api.api_gateway_res_api.id
  resource_id   = aws_api_gateway_resource.api_gateway_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "api_gateway_integration" {
  rest_api_id             = aws_api_gateway_rest_api.api_gateway_res_api.id
  resource_id             = aws_api_gateway_resource.api_gateway_resource.id
  http_method             = aws_api_gateway_method.api_gateway_method.http_method
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda_function.invoke_arn
  integration_http_method = "POST"
}

resource "aws_api_gateway_deployment" "api_gateway_deployment" {
  depends_on = [aws_api_gateway_integration.api_gateway_integration]

  rest_api_id = aws_api_gateway_rest_api.api_gateway_res_api.id
  stage_name  = var.environment
}

resource "aws_api_gateway_stage" "api_gateway_stage" {
  deployment_id = aws_api_gateway_deployment.api_gateway_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.api_gateway_res_api.id
  stage_name    = var.environment

  tags = {
    application = var.app_name
    environment = var.environment
  }
}

resource "aws_route53_record" "api_gateway_cname_record" {
  zone_id = var.route53_zone_id
  name    = "api.${var.app_domain}"
  type    = "CNAME"

  ttl     = 60
  records = [aws_api_gateway_stage.api_gateway_stage.invoke_url]
}

resource "aws_api_gateway_domain_name" "api_gateway_custom_domain" {
  domain_name = "api.${var.app_domain}"

  certificate_arn = var.certificate_arn
}

resource "aws_api_gateway_base_path_mapping" "api_gateway_base_path_mapping" {
  api_id      = aws_api_gateway_rest_api.api_gateway_res_api.id
  stage_name  = aws_api_gateway_stage.api_gateway_stage.stage_name
  domain_name = aws_api_gateway_domain_name.api_gateway_custom_domain.domain_name
}

