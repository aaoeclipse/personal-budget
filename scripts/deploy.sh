#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR/terraform"

# Get outputs
ECR_REPO=$(terraform output -raw ecr_repository_url)
S3_BUCKET=$(terraform output -raw s3_bucket_name)
CF_DIST_ID=$(terraform output -raw cloudfront_distribution_id)
BACKEND_URL=$(terraform output -raw backend_url)
AWS_REGION=$(terraform output -raw 2>/dev/null || echo "us-east-1")

echo "==> Building and pushing backend Docker image..."
cd "$ROOT_DIR/backend"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REPO"
docker build -t "$ECR_REPO:latest" .
docker push "$ECR_REPO:latest"

echo "==> Updating ECS service..."
CLUSTER=$(aws ecs list-clusters --query 'clusterArns[0]' --output text)
SERVICE=$(aws ecs list-services --cluster "$CLUSTER" --query 'serviceArns[0]' --output text)
aws ecs update-service --cluster "$CLUSTER" --service "$SERVICE" --force-new-deployment >/dev/null

echo "==> Building and deploying frontend..."
cd "$ROOT_DIR/frontend"
VITE_API_URL="http://$BACKEND_URL" npm run build
aws s3 sync dist/ "s3://$S3_BUCKET" --delete
aws cloudfront create-invalidation --distribution-id "$CF_DIST_ID" --paths "/*" >/dev/null

echo ""
echo "Deploy complete!"
echo "  Frontend: https://$( cd "$ROOT_DIR/terraform" && terraform output -raw frontend_url )"
echo "  Backend:  http://$BACKEND_URL"
