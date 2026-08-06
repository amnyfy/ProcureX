from fastapi import FastAPI

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