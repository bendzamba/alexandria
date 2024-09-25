output "aws_acm_certificate_production" {
  value = aws_acm_certificate.acm_certificate_production
}

output "aws_acm_certificate_stage" {
  value = aws_acm_certificate.acm_certificate_stage
}

output "aws_acm_certificate_validation_production" {
  value = aws_acm_certificate_validation.acm_certificate_validation_production
}

output "aws_acm_certificate_validation_stage" {
  value = aws_acm_certificate_validation.acm_certificate_validation_stage
}