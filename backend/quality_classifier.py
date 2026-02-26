class QualityClassifier:
    @staticmethod
    def classify(type: str, value: float):
        type = type.lower() if type else ""
        if "air" in type or "aqi" in type:
            return QualityClassifier._classify_air(value)
        elif "water" in type:
            return QualityClassifier._classify_water(value)
        elif "bio" in type:
            return QualityClassifier._classify_biodiversity(value)
        elif "noise" in type:
            return QualityClassifier._classify_noise(value)
        elif "waste" in type:
            return QualityClassifier._classify_waste(value)
        elif "weather" in type:
            return QualityClassifier._classify_weather(value)
        elif "soil" in type:
            return QualityClassifier._classify_soil(value)
        elif "radiation" in type or "uv" in type:
            return QualityClassifier._classify_radiation(value)
        else:
            return {
                "quality_label": "Unknown",
                "color_code": "#808080", # Grey
                "health_msg": "No specific health advice available."
            }

    @staticmethod
    def _classify_biodiversity(value: float):
        # Biodiversity Index or Health (0-100 scale or 0-1)
        # If user passed a small float (0-1), scale it to 100 for this logic
        v = value * 100 if value <= 1.0 else value
        
        if v >= 80:
            return {"quality_label": "Pristine", "color_code": "#00E400", "health_msg": "Ecosystem is thriving with high species richness and minimal disturbance."}
        elif v >= 60:
            return {"quality_label": "Thriving", "color_code": "#92D050", "health_msg": "System is stable and demonstrating strong resilience."}
        elif v >= 40:
            return {"quality_label": "Fair", "color_code": "#FFFF00", "health_msg": "Ecological balance is maintained but vulnerable to external stress."}
        elif v >= 20:
            return {"quality_label": "Degraded", "color_code": "#FF7E00", "health_msg": "Signs ofhabitat loss or invasive species dominance detected."}
        else:
            return {"quality_label": "Critical", "color_code": "#FF0000", "health_msg": "Severe habitat destruction or local extinction event in progress."}

    @staticmethod
    def _classify_air(value: float):
        # Simplified AQI US EPA standard
        if value <= 50:
            return {"quality_label": "Good", "color_code": "#00E400", "health_msg": "Air quality is satisfactory, and air pollution poses little or no risk."}
        elif value <= 100:
            return {"quality_label": "Moderate", "color_code": "#FFFF00", "health_msg": "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution."}
        elif value <= 150:
            return {"quality_label": "Unhealthy for Sensitive Groups", "color_code": "#FF7E00", "health_msg": "Members of sensitive groups may experience health effects. The general public is less likely to be affected."}
        elif value <= 200:
            return {"quality_label": "Unhealthy", "color_code": "#FF0000", "health_msg": "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects."}
        elif value <= 300:
            return {"quality_label": "Very Unhealthy", "color_code": "#8F3F97", "health_msg": "Health alert: The risk of health effects is increased for everyone."}
        else:
            return {"quality_label": "Hazardous", "color_code": "#7E0023", "health_msg": "Health warning of emergency conditions: everyone is more likely to be affected."}

    @staticmethod
    def _classify_water(value: float):
        # Assuming Contamination Level (Lower is Better) for consistency with pollution monitoring.
        if value <= 20:
             return {"quality_label": "Excellent", "color_code": "#0000FF", "health_msg": "Water is pristine and safe for all uses."}
        elif value <= 40:
             return {"quality_label": "Good", "color_code": "#00E400", "health_msg": "Water quality is good, minor treatment may be needed for drinking."}
        elif value <= 60:
             return {"quality_label": "Fair", "color_code": "#FFFF00", "health_msg": "Water quality is fair; filtration recommended."}
        elif value <= 80:
             return {"quality_label": "Poor", "color_code": "#FF7E00", "health_msg": "Water quality is poor; significant treatment required."}
        else:
             return {"quality_label": "Unsafe", "color_code": "#FF0000", "health_msg": "Water is unsafe for consumption or contact."}

    @staticmethod
    def _classify_noise(value: float):
        if value <= 40:
            return {"quality_label": "Quiet", "color_code": "#00E400", "health_msg": "Low ambient noise level."}
        elif value <= 60:
            return {"quality_label": "Moderate", "color_code": "#FFFF00", "health_msg": "Common city noise levels."}
        elif value <= 85:
            return {"quality_label": "Loud", "color_code": "#FF7E00", "health_msg": "Threshold for long-term hearing protection."}
        else:
            return {"quality_label": "Extreme", "color_code": "#FF0000", "health_msg": "Immediate risk of hearing damage."}

    @staticmethod
    def _classify_waste(value: float):
        if value >= 80:
            return {"quality_label": "Efficient", "color_code": "#00E400", "health_msg": "Optimized waste collection and management."}
        elif value >= 50:
            return {"quality_label": "Standard", "color_code": "#FFFF00", "health_msg": "Standard waste management protocols."}
        else:
            return {"quality_label": "Poor", "color_code": "#FF0000", "health_msg": "Risk of environmental contamination from waste."}

    @staticmethod
    def _classify_weather(value: float):
        # Using temp as primary value
        if 15 <= value <= 25:
            return {"quality_label": "Pleasant", "color_code": "#00E400", "health_msg": "Optimal weather conditions."}
        elif value > 35 or value < 0:
            return {"quality_label": "Extreme", "color_code": "#FF0000", "health_msg": "Caution recommended for outdoor activities."}
        else:
            return {"quality_label": "Moderate", "color_code": "#FFFF00", "health_msg": "Standard weather conditions."}

    @staticmethod
    def _classify_radiation(value: float):
        if value <= 2:
            return {"quality_label": "Low", "color_code": "#00E400", "health_msg": "Low UV/Radiation levels."}
        elif value <= 5:
            return {"quality_label": "Moderate", "color_code": "#FFFF00", "health_msg": "Moderate risk; sun protection recommended."}
        elif value <= 10:
            return {"quality_label": "High", "color_code": "#FF7E00", "health_msg": "High risk; limit midday sun exposure."}
        else:
            return {"quality_label": "Extreme", "color_code": "#FF0000", "health_msg": "Very high risk; avoid outdoor exposure."}

    @staticmethod
    def _classify_soil(value: float):
        # Soil Moisture or Health Index (0-100 scale)
        if value >= 70:
            return {"quality_label": "Superior", "color_code": "#00E400", "health_msg": "Excellent soil moisture and nutrient profile."}
        elif value >= 40:
            return {"quality_label": "Good", "color_code": "#92D050", "health_msg": "Healthy soil conditions for vegetation."}
        elif value >= 20:
            return {"quality_label": "Dry", "color_code": "#FFFF00", "health_msg": "Soil is becoming dry; irrigation may be needed."}
        else:
            return {"quality_label": "Arid", "color_code": "#FF0000", "health_msg": "Critical moisture deficit; soil health is at risk."}
