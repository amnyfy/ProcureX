from pydantic import BaseModel


class CompanyCreate(BaseModel):
    name: str
    email: str
    phone: str
    address: str


class CompanyResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    address: str
    user_id: int

    class Config:
        from_attributes = True