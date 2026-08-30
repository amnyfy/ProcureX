from fastapi import FastAPI
from app.routes.users import router as users_router
from app.routes.companies import router as companies_router
from app.routes.tenders import router as tenders_router

app = FastAPI(
    title="ProcureX API",
    description="AI Tender Intelligence Platform Backend",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "message": "Welcome to ProcureX API 🚀"
    }

@app.get("/health")
def health():
    return {
        "status": "Running",
        "server": "ProcureX Backend"
    }

from app.routes.auth import router as auth_router
from app.routes.users import router as users_router

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    users_router,
    prefix="/users",
    tags=["Users"]
)

app.include_ router(
    companies_router,
    prefix="/companies",
    tags=["Companies"]
)
app.include_router(
    tenders_router,
    prefix="/tenders",
    tags=["Tenders"]
)