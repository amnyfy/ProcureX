from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
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

    estimated_value = Column(String(100))

    deadline = Column(DateTime)

    status = Column(
        String(50),
        default="open"
    )

    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False
    )