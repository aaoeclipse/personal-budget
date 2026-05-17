output "backend_url" {
  value = local.backend_url
}

output "frontend_url" {
  value = local.frontend_url
}

output "ecr_repository_url" {
  value = module.backend_service.ecr_repository_url
}

output "s3_bucket_name" {
  value = module.frontend.s3_bucket_name
}

output "cloudfront_distribution_id" {
  value = module.frontend.cloudfront_distribution_id
}
