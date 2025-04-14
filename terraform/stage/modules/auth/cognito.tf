resource "aws_cognito_user_pool" "cognito_user_pool" {
  name = var.app_name

  username_attributes = ["email"]  # Users sign in with email

  alias_attributes = ["preferred_username"]  # Allows an alias like a display name

  deletion_protection = "ACTIVE"

  account_recovery_setting {
    recovery_mechanism {
      name = "verified_email"
      priority = 1
    }
  }

  device_configuration {
    challenge_required_on_new_device = true
    device_only_remembered_on_user_prompt = true
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
    temporary_password_validity_days = 30
  }

  schema {
    attribute_data_type = "String"
    name                = "given_name"
    required            = false
    mutable             = true
    string_attribute_constraints {
      min_length = 0
      max_length = 100
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "family_name"
    required            = false
    mutable             = true
    string_attribute_constraints {
      min_length = 0
      max_length = 100
    }
  }

  username_configuration {
    case_sensitive = false
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
  }
}

resource "aws_cognito_user_pool_client" "cognito_user_pool_client" {
  name         = "${var.app_name}-client"
  user_pool_id = aws_cognito_user_pool.cognito_user_pool.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  supported_identity_providers = ["COGNITO"]

  prevent_user_existence_errors = "ENABLED"

  allowed_oauth_flows = ["implicit"]  # Important for SPAs
  allowed_oauth_scopes = [
    "email",
    "openid",
    "profile"
  ]

  allowed_oauth_flows_user_pool_client = true
  callback_urls = ["https://${var.app_domain}"]  # Return URL
  logout_urls   = ["https://${var.app_domain}/logout"]
}
