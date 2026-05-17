# Mama Budget

A budget management web app with expense tracking, categories, and dashboards.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Mantine v7
- **Backend**: Python + FastAPI + SQLAlchemy 2.0 + Alembic
- **Database**: PostgreSQL
- **Infrastructure**: Terraform + AWS (ECS Fargate, RDS, S3, CloudFront, ALB)

## Local Development

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker (for PostgreSQL)

### First-time Setup

```bash
./scripts/dev-setup.sh
```

This will:
1. Start PostgreSQL in Docker
2. Create a Python virtualenv and install dependencies
3. Run database migrations
4. Install frontend npm packages

### Run the App

```bash
./scripts/dev-run.sh
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Manual Steps

```bash
# Start database
docker compose up -d

# Backend
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm run dev
```

## Deployment (AWS)

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply

# Deploy app
./scripts/deploy.sh
```

## Project Structure

```
mama-budget/
├── frontend/           # React SPA
├── backend/            # FastAPI API
├── terraform/          # AWS infrastructure
├── scripts/            # Dev and deploy scripts
└── docker-compose.yml  # Local PostgreSQL
```

## Features

- Sign up / sign in with JWT auth
- Create and manage budgets with date ranges and spending limits
- Track expenses with categories, amounts, and dates
- Color-coded categories
- Dashboard with spending overview, donut chart, and recent expenses
- Mobile-responsive layout (bottom nav on mobile, sidebar on desktop)
