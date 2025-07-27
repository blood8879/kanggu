from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import excel

app = FastAPI(title="Excel Input Processor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(excel.router, prefix="/api", tags=["excel"])

@app.get("/")
async def root():
    return {"message": "Excel Input Processor API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}