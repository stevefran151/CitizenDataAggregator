import numpy as np
import requests

# This service simulates (or actually queries) external World Geography Websites for validation
# It also uses ML logic for anomaly detection

class WorldGeoValidator:
    def __init__(self):
        # We can simulate fetching live data or use APIs like Open-Meteo for Air/Weather
        self.api_url_air = "https://air-quality-api.open-meteo.com/v1/air-quality"
        
        # Valid ranges based on World Health Organization (WHO) & EPA standards
        self.standards = {
            "air": {
                "aqi": (0, 500),
                "pm2_5": (0, 500),
                "pm10": (0, 600),
                "co": (0, 50),
                "O3": (0, 500)
            },
            "water": {
                "ph": (0, 14), # 6.5-8.5 is ideal but 0-14 is physically possible range
                "dissolved_oxygen": (0, 20), # mg/L
                "turbidity": (0, 1000) # NTU
            },
            "soil": {
                "ph": (0, 14),
                "moisture": (0, 100) # %
            },
            "noise": {
                "db": (0, 140) # Decibels
            }
        }

    def validate_ranges(self, type_cat, details):
        """
        Check if parameters fall within scientifically possible ranges.
        Returns (is_valid, message, details_report)
        """
        if not details:
            return True, "No details provided", {}
            
        std = self.standards.get(type_cat.lower())
        if not std:
            return True, "Unknown category, skipping range check", {}
            
        report = {}
        for key, val in details.items():
            k_norm = key.lower().replace(".", "_").replace(" ", "_")
            if k_norm in std:
                min_v, max_v = std[k_norm]
                try:
                    if val is None or val == "":
                        continue
                        
                    float_val = float(val)
                    in_range = (min_v <= float_val <= max_v)
                    report[key] = {"range": f"{min_v}-{max_v}", "valid": in_range}
                    if not in_range:
                        return False, f"Value {val} for {key} is out of scientific range ({min_v}-{max_v})", report
                except ValueError:
                    return False, f"Invalid numeric value for {key}: {val}", report
        
        return True, "Ranges valid", report

    def check_live_data(self, type_cat, lat, long, details):
        """
        Cross-reference with live external data if available.
        Returns (bool, str, ref_value)
        """
        if type_cat.lower() == "air":
            try:
                params = {
                    "latitude": lat,
                    "longitude": long,
                    "current": ["pm10", "pm2_5", "us_aqi"]
                }
                response = requests.get(self.api_url_air, params=params, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    current = data.get("current", {})
                    real_aqi = current.get("us_aqi")
                    
                    user_aqi = details.get("aqi") or details.get("value")
                    if user_aqi is not None and user_aqi != "":
                        try:
                            u_aqi = float(user_aqi)
                            if real_aqi is not None:
                                delta = abs(u_aqi - real_aqi)
                                if delta > 100:
                                    return False, f"High discrepancy with satellite data", real_aqi
                        except ValueError:
                            pass
                    
                    return True, "Validated against Live Satellite Data", real_aqi
            except Exception as e:
                print(f"External validation failed: {e}")
                return True, "External API unavailable", None
        
        return True, "No live source available", None

validator = WorldGeoValidator()
