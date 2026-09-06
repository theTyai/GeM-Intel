from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import os

from routers import scrape, match, tco, anomaly

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title='GeM-Intel AI Service')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scrape.router)
app.include_router(match.router)
app.include_router(tco.router)
app.include_router(anomaly.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "gem-intel-ai"}

@app.on_event("startup")
async def startup_event():
    port = os.getenv("PORT", "8000")
    logger.info(f"GeM-Intel AI Service starting on port {port}")
