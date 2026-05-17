"""add currency column to expenses

Revision ID: 004
Revises: 003
Create Date: 2024-01-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("expenses", sa.Column("currency", sa.String(3), nullable=False, server_default="USD"))


def downgrade() -> None:
    op.drop_column("expenses", "currency")
