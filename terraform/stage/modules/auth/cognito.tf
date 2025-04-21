resource "aws_cognito_user_pool" "cognito_user_pool" {
  name                      = "alexandria"
  auto_verified_attributes  = ["email"]
  deletion_protection       = "ACTIVE"
  mfa_configuration         = "OFF"
  username_attributes       = ["email"]

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = "1"
    }

    recovery_mechanism {
      name     = "verified_phone_number"
      priority = "2"
    }
  }

  admin_create_user_config {
    allow_admin_create_user_only = "false"
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  password_policy {
    minimum_length                   = "8"
    password_history_size            = "0"
    require_lowercase                = "true"
    require_numbers                  = "true"
    require_symbols                  = "true"
    require_uppercase                = "true"
    temporary_password_validity_days = "7"
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = "false"
    mutable                  = "true"
    name                     = "family_name"
    required                 = "true"

    string_attribute_constraints {
      max_length = "2048"
      min_length = "0"
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = "false"
    mutable                  = "true"
    name                     = "given_name"
    required                 = "true"

    string_attribute_constraints {
      max_length = "2048"
      min_length = "0"
    }
  }

  username_configuration {
    case_sensitive = "false"
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }
}

resource "aws_cognito_user_pool_client" "cognito_user_pool_client" {
  name                                          = "${var.app_name}-client"
  user_pool_id                                  = aws_cognito_user_pool.cognito_user_pool.id
  access_token_validity                         = "60"
  allowed_oauth_flows                           = ["code"]
  allowed_oauth_flows_user_pool_client          = "true"
  allowed_oauth_scopes                          = ["email", "openid", "profile"]
  auth_session_validity                         = "3"
  callback_urls                                 = ["http://localhost:3000", "https://${var.app_domain}"]
  enable_propagate_additional_user_context_data = "false"
  enable_token_revocation                       = "true"
  explicit_auth_flows                           = ["ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_AUTH", "ALLOW_USER_PASSWORD_AUTH", "ALLOW_USER_SRP_AUTH"]
  id_token_validity                             = "60"
  logout_urls                                   = ["http://localhost:3000/logout", "https://${var.app_domain}/logout"]
  prevent_user_existence_errors                 = "ENABLED"
  refresh_token_validity                        = "5"
  supported_identity_providers                  = ["COGNITO"]

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_pool_domain" "auth_domain" {
  domain          = "auth.${var.app_domain}"
  certificate_arn = var.certificate_arn
  user_pool_id    = aws_cognito_user_pool.cognito_user_pool.id
}

resource "aws_route53_record" "auth_a_record" {
  name    = "auth.${var.app_domain}"
  type    = "A"
  zone_id = var.route53_zone_id

  alias {
    name                   = aws_cognito_user_pool_domain.auth_domain.cloudfront_distribution
    zone_id                = aws_cognito_user_pool_domain.auth_domain.cloudfront_distribution_zone_id
    evaluate_target_health = false
  }
}