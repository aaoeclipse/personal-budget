output "alb_dns_name" {
  value = aws_lb.backend.dns_name
}

output "alb_zone_id" {
  value = aws_lb.backend.zone_id
}

output "ecr_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs.id
}
