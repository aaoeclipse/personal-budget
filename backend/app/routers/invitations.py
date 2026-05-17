import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.budget_member import BudgetInvitationResponse, InvitationActionRequest
from app.services import budget_member as member_service

router = APIRouter(prefix="/invitations", tags=["invitations"])


@router.get("", response_model=list[BudgetInvitationResponse])
def list_invitations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return member_service.list_invitations(db, user.id)


@router.post("/{invitation_id}/respond", status_code=204)
def respond_to_invitation(
    invitation_id: uuid.UUID,
    data: InvitationActionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    member_service.respond_to_invitation(db, user.id, invitation_id, data.action)
