from sqlalchemy import Column, Integer, Float, String, ForeignKey
from app.config.database import Base


class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    tender_id = Column(Integer, ForeignKey("tenders.id"))

    eligibility_score = Column(Float)

    winning_probability = Column(Float)

    status = Column(String(50))