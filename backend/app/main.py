from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.tenders import router as tenders_router
from app.routes.companies import router as companies_router
from app.routes.documents import router as documents_router
from app.routes.bid import router as bids_router
from app.routes.ai import router as ai_router
from app.routes.dashboard import router as dashboard_router

app = FastAPI(
    title="ProcureX API",
    description="AI Tender Intelligence Platform Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    users_router,
    prefix="/users",
    tags=["Users"]
)

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    tenders_router,
    prefix="/tenders",
    tags=["Tenders"]
)

app.include_router(
    companies_router,
    prefix="/companies",
    tags=["Companies"]
)

app.include_router(
    documents_router,
    prefix="/documents",
    tags=["Documents"]
)

app.include_router(
    bids_router,
    prefix="/bids",
    tags=["Bids"]
)

app.include_router(
    ai_router,
    prefix="/ai",
    tags=["AI Tender Analysis"]
)

from app.routes.government_tenders import router as government_tenders_router
from app.services.government_tender_service import start_scheduler

# Start background periodic tender sync scheduler (30-minute interval)
start_scheduler()

app.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

app.include_router(
    government_tenders_router,
    prefix="/government-tenders",
    tags=["Government Tenders"]
)