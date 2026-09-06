import math
import random
from typing import List, Dict, Any

try:
    from statsmodels.tsa.arima.model import ARIMA
except ImportError:
    ARIMA = None

class AnomalyDetector:
    def __init__(self):
        pass

    def generate_mock_price_history(self, base_price: float, category: str, periods: int = 90) -> List[Dict]:
        history = []
        for i in range(periods):
            # simple mock random walk + noise
            noise = random.uniform(-0.02, 0.02)
            price = base_price * (1 + noise)
            history.append({"day": i, "price": price})
        return history

    def fit_arima(self, price_series: List[float]) -> Dict:
        if ARIMA is not None and len(price_series) > 10:
            try:
                model = ARIMA(price_series, order=(2, 1, 2))
                res = model.fit()
                forecast = res.forecast(steps=1).iloc[0]
                return {
                    "forecast": forecast,
                    "lower_bound": forecast * 0.95,
                    "upper_bound": forecast * 1.05
                }
            except:
                pass
                
        # Fallback simple moving average
        avg = sum(price_series[-10:]) / min(len(price_series), 10)
        return {
            "forecast": avg,
            "lower_bound": avg * 0.95,
            "upper_bound": avg * 1.05
        }

    def detect_anomaly(self, gem_price: float, fair_market_value: float, variance_percent: float, category: str) -> Dict:
        flags = []
        
        if variance_percent > 20:
            flags.append(f"High price variance: {variance_percent:.1f}% above market average")
            
        hist = self.generate_mock_price_history(fair_market_value, category)
        prices = [h["price"] for h in hist]
        
        forecast = self.fit_arima(prices)
        if gem_price > forecast["upper_bound"]:
            flags.append(f"Price {gem_price} exceeds time-series upper bound {forecast['upper_bound']:.2f}")
            
        severity = "low"
        if len(flags) > 1 or variance_percent > 30:
            severity = "high"
        elif len(flags) == 1:
            severity = "medium"
            
        return {
            "is_anomaly": len(flags) > 0,
            "flags": flags,
            "severity": severity,
            "forecast_data": forecast
        }

    def scan_category(self, category: str) -> List:
        # Mock implementation returning some flags
        return [
            {"id": "GEM-999", "anomaly_type": "price_surge", "severity": "high"}
        ]
