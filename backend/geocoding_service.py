from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import time

class GeocodingService:
    def __init__(self):
        # Using a custom user agent as required by Nominatim's usage policy
        self.geolocator = Nominatim(user_agent="mechovate_environmental_monitor")

    def get_location_name(self, lat: float, lng: float) -> str:
        try:
            location = self.geolocator.reverse((lat, lng), exactly_one=True, language='en')
            if location:
                address = location.raw.get('address', {})
                # Try to get city/town/village and country
                city = address.get('city') or address.get('town') or address.get('village') or address.get('suburb')
                country = address.get('country')
                
                if city and country:
                    return f"{city}, {country}"
                elif country:
                    return country
                return "Unknown Location"
            return f"{lat:.3f}, {lng:.3f}"
        except (GeocoderTimedOut, Exception) as e:
            print(f"Geocoding error: {e}")
            return f"{lat:.3f}, {lng:.3f}"

geocoder = GeocodingService()
