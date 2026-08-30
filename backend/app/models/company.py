from sqlalchemy import Column, Integer, String, ForeignKey
from app.config.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(String(255))

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)