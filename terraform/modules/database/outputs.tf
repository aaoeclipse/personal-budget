output "db_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "db_secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}

output "jwt_secret_arn" {
  value = aws_secretsmanager_secret.jwt_secret.arn
}
