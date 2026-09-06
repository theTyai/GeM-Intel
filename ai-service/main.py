from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import os

from routers import scrape, match, tco, anomaly

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    port = os.getenv("PORT", "8000")
    logger.info(f"GeM-Intel AI Service starting on port {port}")
    yield

app = FastAPI(title='GeM-Intel AI Service', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scrape.router)
app.include_router(match.router)
app.include_router(tco.router)
app.include_router(anomaly.router)


@app.get("/")
def root():
    """Root endpoint – doubles as Render's health-check target."""
    return {"status": "ok", "service": "gem-intel-ai", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "gem-intel-ai"}
