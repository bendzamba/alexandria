data "aws_caller_identity" "current" {}

resource "aws_cloudfront_distribution" "cloudfront_distribution" {

  enabled             = true
  aliases             = var.environment == "production" ? [var.app_domain, "www.${var.app_domain}"] : ["${var.domain_prefix}${var.app_domain}"]
  default_root_object = "index.html"
  is_ipv6_enabled     = true
  wait_for_deployment = true
  comment             = "CloudFront distribution for ${var.app_name} frontend, ${var.environment} stage"

  default_cache_behavior {
    allowed_methods         = ["GET", "HEAD", "OPTIONS"]
    cached_methods          = ["GET", "HEAD", "OPTIONS"]
    target_origin_id        = aws_s3_bucket.s3_bucket.bucket
    viewer_protocol_policy  = "redirect-to-https"
    compress                = true
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  origin {
    domain_name               = aws_s3_bucket.s3_bucket.bucket_regional_domain_name
    origin_access_control_id  = aws_cloudfront_origin_access_control.cloudfront_origin_access_control.id
    origin_id                 = aws_s3_bucket.s3_bucket.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn       = var.environment == "production" ? var.production_certificate_arn : var.stage_certificate_arn
    minimum_protocol_version  = "TLSv1.2_2021"
    ssl_support_method        = "sni-only"
  }

  custom_error_response {
    error_code            = 403
    response_page_path    = "/index.html"
    response_code         = 200
    error_caching_min_ttl = 300
  }

  tags = {
    application = var.app_name
    environment = var.environment
  }

}

resource "aws_cloudfront_origin_access_control" "cloudfront_origin_access_control" {
  name                              = "${var.app_name}-frontend-cloudfront-origin-access-control-${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_iam_policy_document" "iam_policy_document" {
  statement {
    principals {
      identifiers = ["cloudfront.amazonaws.com"]
      type        = "Service"
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.s3_bucket.arn}/*"]

    condition {
      test      = "StringEquals"
      values    = ["arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${aws_cloudfront_origin_access_control.cloudfront_origin_access_control.id}"]
      variable  = "AWS:SourceArn"
    }
  }
}

resource "aws_route53_record" "route53_record_www" {
  name    = var.environment == "production" ? "www.${var.app_domain}" : "${var.domain_prefix}${var.app_domain}"
  type    = "A"
  zone_id = var.route53_zone_id

  alias {
    evaluate_target_health  = false
    name                    = aws_cloudfront_distribution.cloudfront_distribution.domain_name
    zone_id                 = aws_cloudfront_distribution.cloudfront_distribution.hosted_zone_id
  }
}