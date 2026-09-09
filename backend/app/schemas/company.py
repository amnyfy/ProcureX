from pydantic import BaseModel


class CompanyCreate(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    user_id: int

    class Config:
        from_attributes = True