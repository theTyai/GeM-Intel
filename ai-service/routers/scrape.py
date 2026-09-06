from fastapi import APIRouter
from pydantic import BaseModel
from services.scraper import ProductScraper

router = APIRouter(prefix="/scrape", tags=["Scrape"])
scraper = ProductScraper()

class ScrapeRequest(BaseModel):
    gem_url: str
    pin_code: str

@router.post("")
async def scrape_gem(req: ScrapeRequest):
    data = scraper.scrape_gem_product(req.gem_url)
    return {"status": "success", "data": data}
