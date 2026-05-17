locals {
  frontend_domain = var.domain_name != "" ? "${var.frontend_subdomain}.${var.domain_name}" : ""
  backend_domain  = var.domain_name != "" ? "${var.backend_subdomain}.${var.domain_name}" : ""
  frontend_url    = var.domain_name != "" ? "https://${local.frontend_domain}" : "https://${module.frontend.cloudfront_domain_name}"
  backend_url     = var.domain_name != "" ? "https://${local.backend_domain}" : "http://${module.backend_service.alb_dns_name}"
}

module "networking" {
  source       = "./modules/networking"
  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
}

module "database" {
  source                = "./modules/database"
  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.networking.vpc_id
  private_subnet_ids    = module.networking.private_subnet_ids
  ecs_security_group_id = module.backend_service.ecs_security_group_id
  db_instance_class     = var.db_instance_class
}

module "backend_service" {
  source             = "./modules/backend_service"
  project_name       = var.project_name
  environment        = var.environment
  aws_region         = var.aws_region
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  backend_cpu        = var.backend_cpu
  backend_memory     = var.backend_memory
  backend_image_tag  = var.backend_image_tag
  db_secret_arn      = module.database.db_secret_arn
  jwt_secret_arn     = module.database.jwt_secret_arn
  enable_https       = var.domain_name != ""
  certificate_arn    = var.domain_name != "" ? module.dns[0].certificate_arn : ""
  frontend_url       = local.frontend_url
}

module "frontend" {
  source          = "./modules/frontend"
  project_name    = var.project_name
  environment     = var.environment
  domain_name     = local.frontend_domain
  certificate_arn = var.domain_name != "" ? module.dns[0].certificate_arn : ""
}

module "dns" {
  count  = var.domain_name != "" ? 1 : 0
  source = "./modules/dns"

  domain_name         = var.domain_name
  frontend_subdomain  = var.frontend_subdomain
  backend_subdomain   = var.backend_subdomain

  cloudfront_distribution_domain_name    = module.frontend.cloudfront_domain_name
  cloudfront_distribution_hosted_zone_id = module.frontend.cloudfront_hosted_zone_id

  alb_dns_name = module.backend_service.alb_dns_name
  alb_zone_id  = module.backend_service.alb_zone_id
}
