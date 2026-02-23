class QualityClassifier:
    @staticmethod
    def classify(type: str, value: float):
        type = type.lower() if type else ""
        if "air" in type or "aqi" in type:
            return QualityClassifier._classify_air(value)
        elif "water" in type:
            return QualityClassifier._classify_water(value)
        else:
            return {
                "quality_label": "Unknown",
                "color_code": "#808080", # Grey
                "health_msg": "No specific health advice available."
            }

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
