# This file creates the OIDC role for Terraform
# Now I know what you're thinking... 
# How can I use Terraform to create its own permissions!?
# Doesn't it need permissions to create permissions?!
# The answer, young Padawan, is yes, it sure does!
# That's why this particular module should be run locally with your AWS credentials, 
# and then this role can be assumed by something like GitHub actions

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.66"
    }
  }

  required_version = ">= 1.9.5"

  # Uncomment this once your bucket and dynamo table have been created
  # Variables are not allowed here, so swap out the placeholders
  backend "s3" {
    bucket         = "alexandria-terraform-backend-s3-bucket"
    key            = "oidc/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "alexandria-terraform-backend-dynamo-lock-table"
  }
}

provider "aws" {
  region  = var.region
  profile = "terraform-alexandria" # <YOUR AWS PROFILE>
}

resource "aws_iam_openid_connect_provider" "oidc_provider" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com",
  ]

  # SHA-1 thumbprints of the certificate used by GitHub's OIDC provider
  # https://github.blog/changelog/2023-06-27-github-actions-update-on-oidc-integration-with-aws/
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  ]
}

data "aws_iam_policy_document" "oidc_policy_document" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.oidc_provider.arn]
    }

    condition {
      test     = "StringEquals"
      values   = ["sts.amazonaws.com"]
      variable = "token.actions.githubusercontent.com:aud"
    }

    condition {
      test     = "StringEquals"
      values   = ["repo:${var.github_username}/${var.github_repository}:ref:refs/heads/main"]
      variable = "token.actions.githubusercontent.com:sub"
    }
  }
}

resource "aws_iam_role" "github_oidc_role" {
  name               = "github_oidc_role"
  assume_role_policy = data.aws_iam_policy_document.oidc_policy_document.json
}

resource "aws_iam_role_policy_attachment" "apigateway_admin" {
  role       = aws_iam_role.github_oidc_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonAPIGatewayAdministrator"
}

resource "aws_iam_role_policy_attachment" "dynamodb_full_access" {
  role       = aws_iam_role.github_oidc_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_iam_role_policy_attachment" "ec2_full_access" {
  role       = aws_iam_role.github_oidc_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2FullAccess"
}

resource "aws_iam_role_policy_attachment" "efs_full_access" {
  role       = aws_iam_role.github_oidc_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonElasticFileSystemFullAccess"
}

resource "aws_iam_role_policy_attachment" "vpc_full_access" {
  role       = aws_iam_role.github_oidc_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonVPCFullAccess"
}

resource "aws_iam_role_policy_attachment" "acm_full_access" {
  role       = aws_iam_role.github_oidc_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSCertificateManagerFullAccess"
}

resource "aws_iam_role_policy_attachment" "data_sync_full_access" {
  role       = aws_iam_role.github_oidc_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSDataSyncFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_full_access" {
  role       = aws_iam_role.github_oidc_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSLambda_FullAccess"
}

resource "aws_iam_role_policy_attachment" "cloudwatch_full_access" {
  role       = aws_iam_role.github_oidc_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudFrontFullAccess"
}

# Limit of 10 policies attach to a role means we have to consolidate a
# few managed policies into one inline policy. Here we have IAM, S3 and Route53
resource "aws_iam_policy" "consolidated_policy" {
  name = "custom-policy-consolidating-iam-s3-and-route53"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        "Effect": "Allow",
        "Action": [
          "iam:*",
          "organizations:DescribeAccount",
          "organizations:DescribeOrganization",
          "organizations:DescribeOrganizationalUnit",
          "organizations:DescribePolicy",
          "organizations:ListChildren",
          "organizations:ListParents",
          "organizations:ListPoliciesForTarget",
          "organizations:ListRoots",
          "organizations:ListPolicies",
          "organizations:ListTargetsForPolicy"
        ],
        "Resource": "*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "s3:*",
          "s3-object-lambda:*"
        ],
        "Resource": "*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "route53:*",
          "route53domains:*",
          "cloudfront:ListDistributions",
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticbeanstalk:DescribeEnvironments",
          "s3:ListBucket",
          "s3:GetBucketLocation",
          "s3:GetBucketWebsite",
          "ec2:DescribeVpcs",
          "ec2:DescribeVpcEndpoints",
          "ec2:DescribeRegions",
          "sns:ListTopics",
          "sns:ListSubscriptionsByTopic",
          "cloudwatch:DescribeAlarms",
          "cloudwatch:GetMetricStatistics"
        ],
        "Resource": "*"
      },
      {
        "Effect": "Allow",
        "Action": "apigateway:GET",
        "Resource": "arn:aws:apigateway:*::/domainnames"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "custom_policy_attachment" {
  role       = aws_iam_role.github_oidc_role.name
  policy_arn = aws_iam_policy.consolidated_policy.arn
}