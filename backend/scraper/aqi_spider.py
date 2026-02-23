import scrapy
import re

class AQISpider(scrapy.Spider):
    name = "aqi"
    # Target some major cities for validation data
    start_urls = [
        # North America
        "https://aqicn.org/city/los-angeles/", "https://aqicn.org/city/new-york/", "https://aqicn.org/city/chicago/",
        "https://aqicn.org/city/toronto/", "https://aqicn.org/city/mexico-city/", "https://aqicn.org/city/vancouver/",
        
        # South America
        "https://aqicn.org/city/sao-paulo/", "https://aqicn.org/city/buenos-aires/", "https://aqicn.org/city/santiago/",
        "https://aqicn.org/city/lima/", "https://aqicn.org/city/bogota/",
        
        # Europe
        "https://aqicn.org/city/london/", "https://aqicn.org/city/paris/", "https://aqicn.org/city/berlin/",
        "https://aqicn.org/city/madrid/", "https://aqicn.org/city/rome/", "https://aqicn.org/city/moscow/",
        "https://aqicn.org/city/amsterdam/", "https://aqicn.org/city/istanbul/",
        
        # Asia
        "https://aqicn.org/city/beijing/", "https://aqicn.org/city/shanghai/", "https://aqicn.org/city/tokyo/",
        "https://aqicn.org/city/seoul/", "https://aqicn.org/city/bangkok/", "https://aqicn.org/city/singapore/",
        "https://aqicn.org/city/jakarta/", "https://aqicn.org/city/dubai/", "https://aqicn.org/city/tehran/",
        
        # India (Expanded)
        "https://aqicn.org/city/chennai/", "https://aqicn.org/city/delhi/", "https://aqicn.org/city/mumbai/",
        "https://aqicn.org/city/bangalore/", "https://aqicn.org/city/hyderabad/", "https://aqicn.org/city/kolkata/",
        "https://aqicn.org/city/pune/", "https://aqicn.org/city/ahmedabad/",
        
        # Africa
        "https://aqicn.org/city/cairo/", "https://aqicn.org/city/johannesburg/", "https://aqicn.org/city/lagos/",
        "https://aqicn.org/city/nairobi/",
        
        # Oceania
        "https://aqicn.org/city/sydney/", "https://aqicn.org/city/melbourne/"
    ]

    def parse(self, response):
        aqi_text = response.css("#aqiwgtvalue::text").get()
        if not aqi_text:
            aqi_text = response.css(".aqivalue::text").get()
        
        try:
            value = float(aqi_text)
        except:
            # Try finding via regex if direct selector fails
            import re
            match = re.search(r'aqi\s*:\s*(\d+)', response.text)
            if match:
                value = float(match.group(1))
            else:
                value = 0.0

        # Extract city name from URL
        parts = response.url.split("/city/")
        if len(parts) > 1:
            city = parts[1].strip("/").split("/")[0]
        else:
            city = "unknown"
        
        # Try dynamic coordinate extraction from script/map data (Leaflet/Google Maps patterns)
        lat, long = 0.0, 0.0
        
        # Pattern 1: Leaflet setView([lat, long])
        # match = re.search(r'setView\s*\(\s*\[\s*([\d\.-]+)\s*,\s*([\d\.-]+)\s*\]', response.text)
        
        # Pattern 2: Generic distinct latitude/longitude definition often found in JSON blobs
        # "latitude":34.05,"longitude":-118.25
        lat_match = re.search(r'["\']latitude["\']\s*:\s*([\d\.-]+)', response.text)
        long_match = re.search(r'["\']longitude["\']\s*:\s*([\d\.-]+)', response.text)
        
        if lat_match and long_match:
            lat = float(lat_match.group(1))
            long = float(long_match.group(1))
        else:
            # Fallback to hardcoded dictionary if extraction fails
            coords = {
                "los-angeles": (34.05, -118.25), "new-york": (40.71, -74.00), "chicago": (41.87, -87.62),
                "toronto": (43.65, -79.38), "mexico-city": (19.43, -99.13), "london": (51.50, -0.12),
                "paris": (48.85, 2.35), "berlin": (52.52, 13.40), "moscow": (55.75, 37.61),
                "beijing": (39.90, 116.40), "shanghai": (31.23, 121.47), "tokyo": (35.67, 139.65),
                "seoul": (37.56, 126.97), "bangkok": (13.75, 100.50), "singapore": (1.35, 103.81),
                "dubai": (25.20, 55.27), "cairo": (30.04, 31.23), "johannesburg": (-26.20, 28.04),
                "sydney": (-33.86, 151.20), "chennai": (13.08, 80.27), "delhi": (28.70, 77.10),
                "mumbai": (19.07, 72.87), "bangalore": (12.97, 77.59), "hyderabad": (17.38, 78.48),
                "kolkata": (22.57, 88.36), "pune": (18.52, 73.85), "ahmedabad": (23.02, 72.57)
            }
            lat, long = coords.get(city, (0.0, 0.0))

        if value > 0:
            yield {
                "type": "air",
                "value": value,
                "lat": lat,
                "long": long,
                "source": "scraper_aqicn"
            }
