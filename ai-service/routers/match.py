from fastapi import APIRouter
from pydantic import BaseModel
from services.matcher import ProductMatcher
from services.scraper import ProductScraper
from typing import Dict, Any

router = APIRouter(prefix="/match", tags=["Match"])
matcher = ProductMatcher()
scraper = ProductScraper()

class MatchRequest(BaseModel):
    gem_product: Dict[str, Any]
    pin_code: str

@router.post("")
async def match_products(req: MatchRequest):
    # Fetch candidate marketplace listings specifically tailored for the target product
    catalogs = {
        'amazon': scraper.scrape_platform('amazon', req.gem_product),
        'flipkart': scraper.scrape_platform('flipkart', req.gem_product),
        'indiamart': scraper.scrape_platform('indiamart', req.gem_product)
    }
    
    matches = matcher.match_all_platforms(req.gem_product, catalogs, req.pin_code)
    return {"status": "success", "matches": matches}
