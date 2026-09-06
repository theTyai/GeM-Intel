from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.scraper import ProductScraper

router = APIRouter(prefix="/scrape", tags=["Scrape"])
scraper = ProductScraper()

class ScrapeRequest(BaseModel):
    gem_url: str
    pin_code: Optional[str] = None

@router.post("")
def scrape_gem(req: ScrapeRequest):
    data = scraper.scrape_gem_product(req.gem_url)
    return {"status": "success", "data": data}

