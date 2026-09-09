from sqlalchemy import Column, Integer, Float, String, Text, DateTime, Boolean, ForeignKey
from app.config.database import Base


class Tender(Base):
    __tablename__ = "tenders"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    reference_number = Column(
        String(100),
        unique=True,
        nullable=False
    )

    organization = Column(String(255))

    description = Column(Text)

    category = Column(String(100))

    location = Column(String(255))

    estimated_value = Column(Float)

    deadline = Column(DateTime)

    status = Column(
        String(50),
        default="open"
    )

    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=True
    )

    # Government Tender Fields
    is_government_tender = Column(Boolean, default=False)
    source = Column(String(50), default="User")
    source_tender_id = Column(String(100))
    source_url = Column(String(500))
    external_reference_number = Column(String(100))
    department = Column(String(255))
    published_date = Column(DateTime)
    closing_date = Column(DateTime)
    bid_opening_date = Column(DateTime)
    document_url = Column(String(500))