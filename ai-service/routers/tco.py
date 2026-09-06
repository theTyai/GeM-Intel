from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from services.tco_normalizer import TCONormalizer

router = APIRouter(prefix="/tco", tags=["TCO"])
normalizer = TCONormalizer()

class TCORequest(BaseModel):
    gem_product: Dict[str, Any]
    matches: Dict[str, Any]
    pin_code: str

@router.post("")
async def calculate_tco(req: TCORequest):
    result = normalizer.normalize_all(req.gem_product, req.matches, req.pin_code)
    return {"status": "success", "data": result}
