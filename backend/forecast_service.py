import numpy as np
from datetime import datetime, timedelta
from quality_classifier import QualityClassifier
from sqlalchemy.orm import Session
import models

class HealthForecastService:
    def __init__(self):
        self.classifier = QualityClassifier()

    def get_forecast(self, db: Session, type_cat: str = "air"):
        # 1. Determine baseline from last 24h of valid data
        last_24h = datetime.now() - timedelta(hours=24)
        recent_obs = db.query(models.Observation).filter(
            models.Observation.type == type_cat,
            models.Observation.is_valid == True,
            models.Observation.timestamp >= last_24h
        ).all()
        
        if recent_obs:
            baseline = sum(o.value for o in recent_obs) / len(recent_obs)
        else:
            # Fallback baselines
            baselines = {
                "air": 45, 
                "water": 15, 
                "biodiversity": 85,
                "soil": 62,
                "noise": 52,
                "waste": 78,
                "weather": 28,
                "radiation": 3
            }
            baseline = baselines.get(type_cat.lower(), 50)

        # 2. Prepare forecast and historical data
        all_data = []
        now = datetime.now()
        
        # Add historical points
        if recent_obs:
            # Sort by timestamp
            sorted_obs = sorted(recent_obs, key=lambda x: x.timestamp)
            for obs in sorted_obs:
                time_diff = (obs.timestamp - now).total_seconds() / 3600
                classification = self.classifier.classify(type_cat, obs.value)
                all_data.append({
                    "time": obs.timestamp.isoformat(),
                    "hour": round(time_diff, 1),
                    "value": obs.value,
                    "label": classification["quality_label"],
                    "color": classification["color_code"],
                    "health_msg": classification["health_msg"],
                    "is_real": True
                })

        # 3. Generate 72 hours of predictive data
        trend_slope = 0.05 / 72 if type_cat in ["air", "water"] else -0.05 / 72
        
        for h in range(73):
            time_offset = (now + timedelta(hours=h)).hour
            diurnal = 10 * np.sin(2 * np.pi * (time_offset - 8) / 24)
            trend = baseline * (1 + trend_slope * h)
            noise = np.random.normal(0, 2)
            predicted_value = max(0, trend + diurnal + noise)
            
            classification = self.classifier.classify(type_cat, predicted_value)
            
            all_data.append({
                "time": (now + timedelta(hours=h)).isoformat(),
                "hour": h,
                "value": round(predicted_value, 2),
                "label": classification["quality_label"],
                "color": classification["color_code"],
                "health_msg": classification["health_msg"],
                "is_real": False
            })
            
        return {
            "type": type_cat,
            "baseline": round(baseline, 2),
            "forecast": all_data,
            "summary": self._generate_summary(type_cat, all_data)
        }

    def _generate_summary(self, type_cat, forecast):
        # AI-like summarization of the trend
        start_val = forecast[0]["value"]
        end_val = forecast[-1]["value"]
        max_val = max(f["value"] for f in forecast)
        
        trend_desc = "increasing" if end_val > start_val else "decreasing"
        if abs(end_val - start_val) < 2:
            trend_desc = "stable"
            
        peak_hour = next(f["hour"] for f in forecast if f["value"] == max_val)
        
        return f"The 72-hour {type_cat} quality forecast indicates a {trend_desc} trend. Expected peak of {max_val} units around T+{peak_hour} hours. Overall health conditions remain {forecast[-1]['label']}."

forecast_service = HealthForecastService()
