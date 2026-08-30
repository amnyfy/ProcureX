from sqlalchemy import Column, Integer, String, ForeignKey
from app.config.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    tender_id = Column(Integer, ForeignKey("tenders.id"))

    filename = Column(String(255))

    filepath = Column(String(500))