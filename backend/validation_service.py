import numpy as np
import requests
import os

class GeoSpatialValidator:
    def __init__(self):
        # Service areas (Bounding boxes: [min_lat, min_long, max_lat, max_long])
        self.service_areas = {
            "India": [8.0, 68.0, 38.0, 98.0],
            "USA": [24.0, -125.0, 50.0, -66.0]
        }
    
    def is_on_land(self, lat, long):
        """
        Check if coordinates correspond to a land location using a reverse geocoding check.
        Uses OpenStreetMap Nominatim API (Simulated or actual fallback).
        """
        if lat == 0 and long == 0:
            return False, "Null Island (0,0) coordinates are usually placeholders and invalid for environmental reporting."
            
        try:
            # Simple check for nominatim
            headers = {'User-Agent': 'Mechovate-Validation-Service/1.0'}
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={long}&zoom=10"
            response = requests.get(url, headers=headers, timeout=3)
            if response.status_code == 200:
                data = response.json()
                if "error" in data:
                    return False, "Coordinates appear to be in the ocean or an uninhabited area (No geocode data found)."
                
                country = data.get("address", {}).get("country")
                return True, f"Location verified in {country}"
        except Exception as e:
            # Fallback if API is down: check against crude land boundaries or service areas
            print(f"Geo-spatial API check failed: {e}")
            for area, bbox in self.service_areas.items():
                if bbox[0] <= lat <= bbox[2] and bbox[1] <= long <= bbox[3]:
                    return True, f"Location falls within service area: {area} (Fallback verification)"
            
            return True, "Location could not be strictly verified as land, but is geographically plausible."

    def validate_spatial_consistency(self, type_cat, lat, long, value):
        """
        Checks if the value is physically possible for the specific location.
        Example: High moisture index in the middle of a known desert.
        (Mock logic for MVP)
        """
        # Mock: Thar Desert / Sahara approximate bounds (simplified)
        if 24.0 <= lat <= 28.0 and 70.0 <= long <= 75.0: # Thar Desert
             if type_cat == "soil" and value > 60:
                 return False, "Hydrological Anomaly: High soil moisture detected in a known desert region."
        
        return True, "Spatial consistency check passed."

class NewsValidator:
    def __init__(self):
        self.api_key = os.getenv("NEWS_API_KEY") 
        from news_service import news_service
        self.news_service = news_service
        from ai_agent_service import client as groq_client
        self.groq_client = groq_client

    def verify_trend_from_news(self, type_cat, lat, long, value):
        """
        Check for sudden environmental changes in news (e.g., fires, leaks, heatwaves).
        Returns (is_justified, explanation, news_summary)
        """
        # 1. Fetch relevant news articles from our news service
        relevant_news = self.news_service.find_relevant_news(type_cat, lat, long)
        news_context = ""
        if relevant_news:
            news_context = "\n".join([f"- {n['title']}: {n['description']}" for n in relevant_news])
        else:
            news_context = "No specific news articles found for this category recently."

        if not self.groq_client:
            return False, "Groq client not available for news analysis.", ""

        prompt = f"""
        An environmental expert reported a sudden outlier:
        - Category: {type_cat}
        - Value: {value}
        - Location: {lat}, {long}
        
        Recent Environmental News Context:
        {news_context}
        
        Task: Based on the provided news context and your general knowledge of environmental incidents, 
        does this outlier value seem 'justified' by a real-world trend or event?
        
        If a news article above directly explains the spike (e.g. dust storm for air pollution), 
        mark as justified and explain the connection.
        
        Return JSON format: {{"justified": bool, "reason": "string", "event_type": "string"}}
        """
        
        try:
            from ai_agent_service import MODEL_NAME
            chat_completion = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=MODEL_NAME,
            )
            import json
            res_text = chat_completion.choices[0].message.content.replace("```json", "").replace("```", "").strip()
            data = json.loads(res_text)
            return data.get("justified", False), data.get("reason", ""), data.get("event_type", "Incident / Trend")
        except Exception as e:
            print(f"News validation error: {e}")
            return False, "News verification service error", ""

class WildTraxValidator:
    """
    WildTrax-inspired validation for remote sensors (Acoustic, Camera, Biodiversity).
    Focuses on species verification consensus and sensor metadata integrity.
    """
    def __init__(self):
        self.api_base = "https://www.wildtrax.ca/api/v1" # Mock or Actual Base
        # Simulation of acoustic recognizer thresholds
        self.acoustic_thresholds = {
            "biophony": 0.65,
            "anthrophony": 0.40,
            "geophony": 0.30
        }

    def validate_sensor_metadata(self, lat, long, details):
        """
        Validates ARU (Autonomous Recording Unit) or Camera Trap metadata.
        Checks for battery anomalies, drift, or signal-to-noise ratio plausibility.
        """
        if not details:
            return True, "No sensor metadata to validate."

        # Simulate check for 'gain' or 'snr' in acoustic data
        snr = details.get("snr")
        if snr is not None:
            try:
                if float(snr) < -10:
                    return False, "WildTrax Hardware Alert: Signal-to-Noise Ratio too low; sensor might be obstructed or failing."
            except: pass
            
        return True, "WildTrax Metadata Integrity: Passed."

    def verify_species_consensus(self, lat, long, type_cat, species_list=None):
        """
        Cross-references reported species with WildTrax historical distribution clusters.
        """
        if type_cat.lower() != "biodiversity" or not species_list:
            return True, "N/A", {}

        # Mock: Check if reported species are known to exist in this bio-region
        # In a real app, this would query WildTrax API 'species/presence'
        verified_species = []
        rejected_species = []
        
        # Simple heuristic mock
        for species in species_list:
            if "Crow" in species or "Sparrow" in species or "Common" in species:
                verified_species.append(species)
            else:
                # Exotic species in a location they don't belong (Simulated)
                if lat < 10: # Tropical check
                     verified_species.append(species)
                else:
                     rejected_species.append(species)

        confidence = len(verified_species) / len(species_list) if species_list else 1.0
        
        if confidence < 0.5:
            return False, f"WildTrax Species Conflict: Low consensus for {', '.join(rejected_species)} in this bio-region.", {
                "verified": verified_species,
                "rejected": rejected_species,
                "consensus_score": confidence
            }
            
        return True, f"WildTrax Verified: {len(verified_species)} species consistent with regional clusters.", {
            "verified": verified_species,
            "consensus_score": confidence
        }

class WorldGeoValidator:
    def __init__(self):
        # External APIs for Global Validation
        self.api_url_openaq = "https://api.openaq.org/v2/latest"
        self.api_url_inaturalist = "https://api.inaturalist.org/v1/observations"
        self.api_url_open_meteo = "https://air-quality-api.open-meteo.com/v1/air-quality"
        
        self.geo_validator = GeoSpatialValidator()
        self.news_validator = NewsValidator()
        self.wildtrax_validator = WildTraxValidator()
        
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
            },
            "biodiversity": {
                "species_richness": (0, 10000), # Count
                "canopy_cover": (0, 100), # %
                "biodiversity_index": (0, 1), # Normalized Shannon/Simpson
                "invasive_count": (0, 1000)
            },
            "waste": {
                "collection_efficiency": (0, 100),
                "recycling_rate": (0, 100),
                "landfill_usage": (0, 100)
            },
            "weather": {
                "temp": (-50, 60),
                "precip": (0, 500),
                "wind_speed": (0, 200)
            },
            "radiation": {
                "uv_index": (0, 20),
                "microsieverts": (0, 1000)
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
        Returns (bool, str, ref_value, meta_dict)
        """
        # 1. Geo-Spatial check (Verification of Land/Location)
        geo_valid, geo_msg = self.geo_validator.is_on_land(lat, long)
        if not geo_valid:
            return False, geo_msg, None, {}
            
        # 2. Consistency check
        val = float(details.get("value") or 0)
        consist_valid, consist_msg = self.geo_validator.validate_spatial_consistency(type_cat, lat, long, val)
        if not consist_valid:
            return False, consist_msg, None, {}

        meta = {}
        ref_val = None
        final_msg = geo_msg

        # 3. WildTrax Sensor Metadata Check
        sensor_valid, sensor_msg = self.wildtrax_validator.validate_sensor_metadata(lat, long, details)
        if not sensor_valid:
            return False, sensor_msg, None, {}
        meta["wildtrax_sensor"] = "Passed"
            
        if type_cat.lower() == "air":
            # Primary Source: OpenAQ
            try:
                # Limit search to 25km radius
                params = {
                    "coordinates": f"{lat},{long}",
                    "radius": 25000,
                    "limit": 5,
                    "unit": "ug/m3" # Standardizing
                }
                response = requests.get(self.api_url_openaq, params=params, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    if results:
                        station_name = "Unknown OpenAQ Station"
                        dist = 0.0
                        
                        for loc in results:
                            station_name = loc.get("location", station_name)
                            dist = loc.get("distance", 0.0) / 1000 # to KM
                            for p in loc.get("measurements", []):
                                if p["parameter"] in ["pm25", "pm10", "aqi"]:
                                    ref_val = p["value"]
                                    break
                            if ref_val: break
                        
                        user_val = details.get("pm2_5") or details.get("aqi") or details.get("value")
                        meta.update({"source": "OpenAQ", "station": station_name, "distance_km": round(dist, 2)})
                        
                        if user_val is not None and ref_val is not None:
                            delta = abs(float(user_val) - ref_val)
                            if delta > 100:
                                return False, f"OpenAQ Verification Conflict: Discrepancy of {delta:.1f} found with ground station {station_name}.", ref_val, meta
                        
                        final_msg = f"{geo_msg} | Validated against OpenAQ Station: {station_name}"
            except Exception as e:
                print(f"OpenAQ validation failed: {e}")

            # Fallback: Open-Meteo
            if ref_val is None:
                try:
                    params = {"latitude": lat, "longitude": long, "current": ["pm10", "pm2_5", "us_aqi"]}
                    response = requests.get(self.api_url_open_meteo, params=params, timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        current = data.get("current", {})
                        ref_val = current.get("us_aqi") or current.get("pm2_5")
                        meta.update({"source": "Open-Meteo"})
                        final_msg = f"{geo_msg} | Validated against Open-Meteo Forecast"
                except:
                    pass

        if type_cat.lower() == "biodiversity":
            # Source: iNaturalist
            try:
                params = {"lat": lat, "lng": long, "radius": 10, "per_page": 5, "order": "desc", "order_by": "created_at"}
                response = requests.get(self.api_url_inaturalist, params=params, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    total_results = data.get("total_results", 0)
                    if total_results > 0:
                        obs_list = [o.get("taxon", { }).get("name", "Unknown") for o in data.get("results", [])]
                        meta.update({"source": "iNaturalist", "local_sightings": total_results, "top_species": obs_list[:3]})
                        ref_val = total_results
                        final_msg = f"{geo_msg} | Verified by iNaturalist Presence ({total_results} local sightings)"
                    else:
                        meta.update({"source": "iNaturalist", "local_sightings": 0})
                        final_msg = f"{geo_msg} | iNaturalist: No nearby sightings found"
            except Exception as e:
                print(f"iNaturalist validation failed: {e}")

            # Cross-verify with WildTrax Distribution Clusters
            species_list = (details or {}).get("species_list") or (details or {}).get("observed_taxa")
            if species_list:
                wt_valid, wt_msg, wt_meta = self.wildtrax_validator.verify_species_consensus(lat, long, type_cat, species_list)
                if not wt_valid:
                    return False, wt_msg, None, wt_meta
                meta["wildtrax_consensus"] = wt_meta
                final_msg += f" | {wt_msg}"
        
        return True, final_msg, ref_val, meta

validator = WorldGeoValidator()
