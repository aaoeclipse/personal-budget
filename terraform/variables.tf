variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "mama-budget"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "backend_cpu" {
  type    = number
  default = 256
}

variable "backend_memory" {
  type    = number
  default = 512
}

variable "backend_image_tag" {
  type    = string
  default = "latest"
}

variable "domain_name" {
  description = "Root domain name (e.g., santiagopaiz.com). Leave empty to skip custom domain setup."
  type        = string
  default     = ""
}

variable "frontend_subdomain" {
  description = "Subdomain for the frontend (e.g., mamabudget)"
  type        = string
  default     = "mamabudget"
}

variable "backend_subdomain" {
  description = "Subdomain for the backend API (e.g., api.mamabudget)"
  type        = string
  default     = "api.mamabudget"
}
