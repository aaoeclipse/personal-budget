"""seed default categories for existing users

Revision ID: 005
Revises: 004
Create Date: 2024-01-01 00:00:00.000000
"""

import uuid

from alembic import op
import sqlalchemy as sa

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None

DEFAULT_CATEGORIES = [
    {"name": "Food", "color": "#FF6B6B", "emoji": "\U0001f355"},
    {"name": "Coffee", "color": "#8B4513", "emoji": "\u2615"},
    {"name": "Groceries", "color": "#4CAF50", "emoji": "\U0001f6d2"},
    {"name": "Shopping", "color": "#E91E63", "emoji": "\U0001f6cd\ufe0f"},
    {"name": "Transport", "color": "#2196F3", "emoji": "\U0001f697"},
    {"name": "Entertainment", "color": "#9C27B0", "emoji": "\U0001f3ac"},
    {"name": "Bills", "color": "#FF9800", "emoji": "\U0001f4a1"},
    {"name": "Health", "color": "#00BCD4", "emoji": "\U0001f48a"},
    {"name": "Dining", "color": "#F44336", "emoji": "\U0001f37d\ufe0f"},
    {"name": "Gas", "color": "#607D8B", "emoji": "\u26fd"},
    {"name": "Subscriptions", "color": "#673AB7", "emoji": "\U0001f4f1"},
    {"name": "Rent", "color": "#795548", "emoji": "\U0001f3e0"},
    {"name": "Other", "color": "#9E9E9E", "emoji": "\U0001f4e6"},
]


def upgrade() -> None:
    conn = op.get_bind()

    # Get all users
    users = conn.execute(sa.text("SELECT id FROM users")).fetchall()

    for (user_id,) in users:
        # Check if user already has categories
        count = conn.execute(
            sa.text("SELECT COUNT(*) FROM categories WHERE user_id = :uid"),
            {"uid": user_id},
        ).scalar()
        if count > 0:
            continue

        # Seed default categories
        for cat in DEFAULT_CATEGORIES:
            conn.execute(
                sa.text(
                    "INSERT INTO categories (id, user_id, name, color, emoji) "
                    "VALUES (:id, :uid, :name, :color, :emoji)"
                ),
                {
                    "id": str(uuid.uuid4()),
                    "uid": user_id,
                    "name": cat["name"],
                    "color": cat["color"],
                    "emoji": cat["emoji"],
                },
            )


def downgrade() -> None:
    pass
