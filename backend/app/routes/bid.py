from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.auth.dependencies import get_current_user
from app.models.bid import Bid
from app.models.tender import Tender
from app.schemas.bid import BidCreate, BidResponse, BidStatusUpdate


router = APIRouter()


# Create Bid
@router.post("/", response_model=BidResponse)
def create_bid(
    bid: BidCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = int(current_user["sub"])

    # Check tender exists
    tender = db.query(Tender).filter(Tender.id == bid.tender_id).first()

    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Tender not found"
        )

    # Create bid
    new_bid = Bid(
        user_id=user_id,
        tender_id=bid.tender_id,
        eligibility_score=bid.eligibility_score,
        winning_probability=bid.winning_probability,
        status=bid.status
    )

    db.add(new_bid)
    db.commit()
    db.refresh(new_bid)

    return new_bid

# Get My Bids
@router.get("/", response_model=list[BidResponse])
def get_my_bids(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

    bids = (
        db.query(Bid)
        .filter(Bid.user_id == user_id)
        .all()
    )

    return bids

# Get Single Bid
@router.get("/{bid_id}", response_model=BidResponse)
def get_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

    bid = (
        db.query(Bid)
        .filter(
            Bid.id == bid_id,
            Bid.user_id == user_id
        )
        .first()
    )

    if not bid:
        raise HTTPException(
            status_code=404,
            detail="Bid not found"
        )

    return bid

# Update Bid Status
@router.patch("/{bid_id}/status", response_model=BidResponse)
def update_bid_status(
    bid_id: int,
    status_data: BidStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

    bid = (
        db.query(Bid)
        .filter(
            Bid.id == bid_id,
            Bid.user_id == user_id
        )
        .first()
    )

    if not bid:
        raise HTTPException(
            status_code=404,
            detail="Bid not found"
        )

    bid.status = status_data.status

    db.commit()
    db.refresh(bid)

    return bid

# Delete Bid
@router.delete("/{bid_id}")
def delete_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

    bid = (
        db.query(Bid)
        .filter(
            Bid.id == bid_id,
            Bid.user_id == user_id
        )
        .first()
    )

    if not bid:
        raise HTTPException(
            status_code=404,
            detail="Bid not found"
        )

    db.delete(bid)
    db.commit()

    return {
        "message": "Bid deleted successfully"
    }