from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.anomaly_detector import AnomalyDetector

router = APIRouter(prefix="/anomaly", tags=["Anomaly"])
detector = AnomalyDetector()

class AnomalyRequest(BaseModel):
    gem_product_id: str
    gem_landed_cost: float
    fair_market_value: float
    variance_percent: float
    category: str

@router.post("")
async def detect(req: AnomalyRequest):
    res = detector.detect_anomaly(
        req.gem_landed_cost, 
        req.fair_market_value, 
        req.variance_percent, 
        req.category
    )
    return {"status": "success", "data": res}

@router.get("/scan")
async def scan(category: Optional[str] = None):
    res = detector.scan_category(category or "all")
    return {"status": "success", "data": res}
