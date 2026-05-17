variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "domain_name" {
  description = "Custom domain name for CloudFront (e.g., mamabudget.santiagopaiz.com)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for custom domain"
  type        = string
  default     = ""
}
