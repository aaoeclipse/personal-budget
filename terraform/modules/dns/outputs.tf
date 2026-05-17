output "certificate_arn" {
  value = aws_acm_certificate_validation.main.certificate_arn
}

output "frontend_fqdn" {
  value = aws_route53_record.frontend.fqdn
}

output "backend_fqdn" {
  value = aws_route53_record.backend.fqdn
}

output "zone_id" {
  value = data.aws_route53_zone.main.zone_id
}
