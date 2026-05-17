variable "domain_name" {
  description = "Root domain name (e.g., santiagopaiz.com)"
  type        = string
}

variable "frontend_subdomain" {
  description = "Subdomain for frontend (e.g., mamabudget)"
  type        = string
}

variable "backend_subdomain" {
  description = "Subdomain for backend API (e.g., api.mamabudget)"
  type        = string
}

variable "cloudfront_distribution_domain_name" {
  description = "CloudFront distribution domain name"
  type        = string
}

variable "cloudfront_distribution_hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name for backend"
  type        = string
}

variable "alb_zone_id" {
  description = "ALB hosted zone ID"
  type        = string
}
