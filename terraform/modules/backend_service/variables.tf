variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
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

variable "db_secret_arn" {
  type = string
}

variable "jwt_secret_arn" {
  type = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS on ALB"
  type        = string
  default     = ""
}

variable "frontend_url" {
  description = "Frontend URL for CORS configuration"
  type        = string
  default     = "*"
}
