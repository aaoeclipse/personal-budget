from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.exceptions import AppException, Forbidden, NotFound
from app.models.budget import Budget
from app.models.budget_invitation import BudgetInvitation
from app.models.budget_member import BudgetMember
from app.models.user import User
from app.schemas.budget_member import BudgetInvitationResponse, BudgetMemberResponse


def get_user_role(db: Session, budget_id: uuid.UUID, user_id: uuid.UUID) -> str | None:
    """Returns the user's role in a budget, or None if not a member."""
    budget = db.get(Budget, budget_id)
    if not budget:
        return None
    if budget.user_id == user_id:
        return "owner"
    member = db.execute(
        select(BudgetMember).where(BudgetMember.budget_id == budget_id, BudgetMember.user_id == user_id)
    ).scalar_one_or_none()
    if member:
        return member.role
    return None


def invite_member(db: Session, budget_id: uuid.UUID, inviter_id: uuid.UUID, email: str, role: str) -> BudgetInvitation:
    """Invite a user to a budget by email."""
    budget = db.get(Budget, budget_id)
    if not budget:
        raise NotFound("Budget not found")
    if budget.user_id != inviter_id:
        raise Forbidden("Only the owner can invite members")

    # Find invitee by email
    invitee = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not invitee:
        raise AppException(400, "No user found with that email")

    if invitee.id == inviter_id:
        raise AppException(400, "Cannot invite yourself")

    # Check if already a member
    existing_member = db.execute(
        select(BudgetMember).where(BudgetMember.budget_id == budget_id, BudgetMember.user_id == invitee.id)
    ).scalar_one_or_none()
    if existing_member:
        raise AppException(400, "User is already a member of this budget")

    # Check for existing invitation
    existing_invite = db.execute(
        select(BudgetInvitation).where(
            BudgetInvitation.budget_id == budget_id, BudgetInvitation.invitee_id == invitee.id
        )
    ).scalar_one_or_none()

    if existing_invite:
        if existing_invite.status == "pending":
            raise AppException(400, "Invitation already pending")
        # Re-send declined invitation
        existing_invite.status = "pending"
        existing_invite.role = role
        existing_invite.responded_at = None
        db.commit()
        db.refresh(existing_invite)
        return existing_invite

    invitation = BudgetInvitation(
        budget_id=budget_id,
        inviter_id=inviter_id,
        invitee_id=invitee.id,
        role=role,
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return invitation


def list_invitations(db: Session, user_id: uuid.UUID) -> list[BudgetInvitationResponse]:
    """List pending invitations for a user."""
    rows = db.execute(
        select(BudgetInvitation)
        .where(BudgetInvitation.invitee_id == user_id, BudgetInvitation.status == "pending")
        .order_by(BudgetInvitation.created_at.desc())
    ).scalars().all()

    results = []
    for inv in rows:
        budget = db.get(Budget, inv.budget_id)
        inviter = db.get(User, inv.inviter_id)
        results.append(BudgetInvitationResponse(
            id=inv.id,
            budget_id=inv.budget_id,
            budget_name=budget.name if budget else "Unknown",
            inviter_name=inviter.name if inviter else "Unknown",
            role=inv.role,
            status=inv.status,
            created_at=inv.created_at,
        ))
    return results


def respond_to_invitation(db: Session, user_id: uuid.UUID, invitation_id: uuid.UUID, action: str) -> None:
    """Accept or decline an invitation."""
    invitation = db.get(BudgetInvitation, invitation_id)
    if not invitation:
        raise NotFound("Invitation not found")
    if invitation.invitee_id != user_id:
        raise Forbidden()
    if invitation.status != "pending":
        raise AppException(400, "Invitation already responded to")

    invitation.responded_at = datetime.now(timezone.utc)

    if action == "accept":
        invitation.status = "accepted"
        # Create membership
        member = BudgetMember(
            budget_id=invitation.budget_id,
            user_id=user_id,
            role=invitation.role,
        )
        db.add(member)

        # Mark budget as shared and ensure owner has a BudgetMember row
        budget = db.get(Budget, invitation.budget_id)
        if budget and not budget.is_shared:
            budget.is_shared = True
            # Create owner member row if it doesn't exist
            owner_member = db.execute(
                select(BudgetMember).where(
                    BudgetMember.budget_id == budget.id, BudgetMember.user_id == budget.user_id
                )
            ).scalar_one_or_none()
            if not owner_member:
                db.add(BudgetMember(budget_id=budget.id, user_id=budget.user_id, role="owner"))
    elif action == "decline":
        invitation.status = "declined"
    else:
        raise AppException(400, "Invalid action")

    db.commit()


def list_members(db: Session, budget_id: uuid.UUID) -> list[BudgetMemberResponse]:
    """List all members of a budget."""
    budget = db.get(Budget, budget_id)
    if not budget:
        raise NotFound("Budget not found")

    members = db.execute(
        select(BudgetMember).where(BudgetMember.budget_id == budget_id)
    ).scalars().all()

    # If budget is not shared yet, just return the owner
    if not members:
        owner = db.get(User, budget.user_id)
        return [BudgetMemberResponse(
            id=uuid.uuid4(),
            user_id=budget.user_id,
            user_name=owner.name if owner else "Unknown",
            user_email=owner.email if owner else "",
            role="owner",
            created_at=budget.created_at,
        )]

    results = []
    for m in members:
        user = db.get(User, m.user_id)
        results.append(BudgetMemberResponse(
            id=m.id,
            user_id=m.user_id,
            user_name=user.name if user else "Unknown",
            user_email=user.email if user else "",
            role=m.role,
            created_at=m.created_at,
        ))
    return results


def remove_member(db: Session, budget_id: uuid.UUID, owner_id: uuid.UUID, member_user_id: uuid.UUID) -> None:
    """Remove a member from a budget. Owner can remove others, members can leave."""
    budget = db.get(Budget, budget_id)
    if not budget:
        raise NotFound("Budget not found")

    # Allow: owner removing someone, or a member removing themselves
    is_owner = budget.user_id == owner_id
    is_self_removal = owner_id == member_user_id

    if not is_owner and not is_self_removal:
        raise Forbidden("Only the owner can remove members")

    if is_owner and member_user_id == owner_id:
        raise AppException(400, "Owner cannot leave their own budget")

    member = db.execute(
        select(BudgetMember).where(
            BudgetMember.budget_id == budget_id, BudgetMember.user_id == member_user_id
        )
    ).scalar_one_or_none()
    if not member:
        raise NotFound("Member not found")

    db.delete(member)
    db.flush()

    # Check if budget still has non-owner members
    remaining = db.execute(
        select(BudgetMember).where(
            BudgetMember.budget_id == budget_id,
            BudgetMember.user_id != budget.user_id,
        )
    ).scalars().all()

    if not remaining:
        budget.is_shared = False
        # Remove owner member row too
        owner_member = db.execute(
            select(BudgetMember).where(
                BudgetMember.budget_id == budget_id, BudgetMember.user_id == budget.user_id
            )
        ).scalar_one_or_none()
        if owner_member:
            db.delete(owner_member)

    db.commit()
