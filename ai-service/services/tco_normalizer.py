import json
import os
import statistics
from typing import Dict, Any, List

class TCONormalizer:
    def __init__(self):
        data_dir = os.getenv("MOCK_DATA_DIR", "data")
        try:
            with open(os.path.join(data_dir, "hsn_gst.json"), 'r') as f:
                data = json.load(f)
                self.hsn_rates = data.get("hsn_rates", {})
                self.cat_to_hsn = data.get("category_to_hsn", {})
        except:
            self.hsn_rates = {}
            self.cat_to_hsn = {}

    def get_gst_rate(self, category: str) -> float:
        cat_lower = str(category or "default").lower()
        hsn = self.cat_to_hsn.get(cat_lower, self.cat_to_hsn.get("default", "8471"))
        rate = self.hsn_rates.get(hsn, self.hsn_rates.get("default", 18))
        return float(rate)

    def normalize_gst(self, base_price: float, category: str, is_gst_inclusive: bool = True) -> dict:
        rate = self.get_gst_rate(category)
        if is_gst_inclusive:
            ex_gst = base_price / (1 + rate / 100)
            gst_amount = base_price - ex_gst
            return {
                "base_price_ex_gst": ex_gst,
                "gst_amount": gst_amount,
                "base_price_inc_gst": base_price,
                "gst_rate": rate
            }
        else:
            gst_amount = base_price * rate / 100
            inc_gst = base_price + gst_amount
            return {
                "base_price_ex_gst": base_price,
                "gst_amount": gst_amount,
                "base_price_inc_gst": inc_gst,
                "gst_rate": rate
            }

    def estimate_freight(self, base_price: float, pin_code: str, platform: str) -> float:
        freight = 0.0
        plat_lower = str(platform).lower()
        if plat_lower in ['amazon', 'flipkart']:
            if base_price <= 499:
                freight = 40.0
        elif plat_lower == 'indiamart':
            if base_price < 5000:
                freight = 150.0
                
        if pin_code and len(pin_code) >= 1:
            first_digit = str(pin_code)[0]
            if first_digit in ['5', '6']:
                freight += 50.0
            elif first_digit in ['7', '8', '9']:
                freight += 150.0
                
        return freight

    def normalize_amc(self, warranty_years: float, amc_per_year: float, base_price: float) -> float:
        if warranty_years > 1:
            return (warranty_years - 1) * (base_price * 0.07)
        return 0.0

    def compute_landed_cost(self, product: dict, platform: str, pin_code: str) -> dict:
        base_price = float(product.get('price', 0.0) or 0.0)
        category = product.get('category', 'default')
        
        gst_info = self.normalize_gst(base_price, category, is_gst_inclusive=True)
        freight = self.estimate_freight(base_price, pin_code, platform)
        
        warranty_str = product.get('specifications', {}).get('warranty', '1')
        warranty_years = 1.0
        if 'year' in str(warranty_str).lower():
            try:
                warranty_years = float(str(warranty_str).lower().split()[0])
            except:
                pass
                
        amc = self.normalize_amc(warranty_years, 0.0, base_price)
        landed_cost = gst_info["base_price_inc_gst"] + freight + amc
        
        return {
            "base_price": base_price,
            "gst_rate": gst_info["gst_rate"],
            "gst_amount": gst_info["gst_amount"],
            "freight": freight,
            "amc": amc,
            "landed_cost": landed_cost
        }

    def normalize_all(self, gem_product: dict, matches_by_platform: dict, pin_code: str) -> dict:
        gem_tco = self.compute_landed_cost(gem_product, 'gem', pin_code)
        
        platform_tcos = []
        sources_count = 0
        for plat, matches in matches_by_platform.items():
            if matches:
                sources_count += 1
            for m in matches:
                tco = self.compute_landed_cost(m, plat, pin_code)
                platform_tcos.append(tco['landed_cost'])
                m['tco'] = tco
                
        if not platform_tcos:
            bmv = gem_tco['landed_cost']
        else:
            bmv = statistics.median(platform_tcos)
            
        if bmv > 0:
            variance = ((gem_tco['landed_cost'] - bmv) / bmv) * 100
        else:
            variance = 0.0
            
        # Professional Risk Classification
        risk_drivers = []
        if variance <= 5:
            status = 'benchmark_aligned'
            classification = 'Benchmark Aligned'
            guidance = 'Market rate verified reasonable under GFR Rule 149. Compliant for procurement.'
        elif variance <= 20:
            status = 'review_recommended'
            classification = 'Review Recommended'
            guidance = f'Potential GFR 149 justification required. GeM price exceeds market benchmark by {variance:.1f}%.'
            risk_drivers.append(f"GeM landed price (₹{gem_tco['landed_cost']:,.0f}) is higher than Benchmark Market Value (₹{bmv:,.0f}).")
        else:
            status = 'high_risk_variance'
            classification = 'High-Risk Variance'
            guidance = f'High procurement risk: Significant variance of +{variance:.1f}%. Detailed price justification & CAG scrutiny mandatory.'
            risk_drivers.append(f"Excessive price divergence (+{variance:.1f}%) above multi-source market median.")

        # Additional risk driver explanations
        if pin_code and str(pin_code)[0] in ['7', '8', '9']:
            risk_drivers.append(f"Regional delivery freight adjustment applied for PIN {pin_code}.")
        if gem_tco['gst_rate'] > 0:
            risk_drivers.append(f"Standardized HSN tax parity applied at {gem_tco['gst_rate']:.0f}% GST.")

        evidence_confidence = 'HIGH' if sources_count >= 2 else ('MEDIUM' if sources_count == 1 else 'INSUFFICIENT')

        return {
            "gem_tco": gem_tco,
            "matches_with_tco": matches_by_platform,
            "benchmark_market_value": bmv,
            "fair_market_value": bmv, # maintain alias
            "variance_percent": variance,
            "status": status,
            "risk_assessment": {
                "classification": classification,
                "guidance": guidance,
                "evidenceConfidence": evidence_confidence,
                "independentSourcesCount": sources_count,
                "primaryRiskDrivers": risk_drivers
            }
        }
