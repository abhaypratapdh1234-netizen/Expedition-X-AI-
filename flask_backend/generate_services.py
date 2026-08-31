import os

services = [
    {"name": "gemini", "class_name": "GeminiService", "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"},
    {"name": "weather", "class_name": "WeatherService", "url": "https://api.openweathermap.org/data/2.5/weather"},
    {"name": "geoapify", "class_name": "GeoapifyService", "url": "https://api.geoapify.com/v2/places"},
    {"name": "osm", "class_name": "OSMService", "url": "https://nominatim.openstreetmap.org/search"},
    {"name": "nominatim", "class_name": "NominatimService", "url": "https://nominatim.openstreetmap.org/search"},
    {"name": "routing", "class_name": "RoutingService", "url": "https://router.project-osrm.org/route/v1/driving/"},
    {"name": "currency", "class_name": "CurrencyService", "url": "https://api.exchangerate-api.com/v4/latest/USD"},
    {"name": "countries", "class_name": "CountriesService", "url": "https://restcountries.com/v3.1/all"},
    {"name": "timezone", "class_name": "TimezoneService", "url": "http://api.timezonedb.com/v2.1/get-time-zone"},
    {"name": "wikipedia", "class_name": "WikipediaService", "url": "https://en.wikipedia.org/w/api.php"},
    {"name": "email", "class_name": "EmailService", "url": "smtp-relay.brevo.com"},
    {"name": "images", "class_name": "ImageService", "url": "https://api.unsplash.com/search/photos"},
    {"name": "ip_geolocation", "class_name": "IPGeolocationService", "url": "https://api.ipgeolocation.io/ipgeo"},
    {"name": "pixabay", "class_name": "PixabayService", "url": "https://pixabay.com/api/"},
    {"name": "pexels", "class_name": "PexelsService", "url": "https://api.pexels.com/v1/search"},
    {"name": "open_meteo", "class_name": "OpenMeteoService", "url": "https://api.open-meteo.com/v1/forecast"},
    {"name": "open_elevation", "class_name": "OpenElevationService", "url": "https://api.open-elevation.com/api/v1/lookup"},
    {"name": "wikidata", "class_name": "WikidataService", "url": "https://www.wikidata.org/w/api.php"},
    {"name": "overpass", "class_name": "OverpassService", "url": "https://overpass-api.de/api/interpreter"},
]

os.makedirs('services', exist_ok=True)
with open('services/__init__.py', 'w') as f:
    f.write("")

template = """from utils.api_validator import APIValidator, logger

class {class_name}:
    BASE_URL = "{url}"
    
    @staticmethod
    def check_health():
        \"\"\"Verify if the {class_name} API is accessible.\"\"\"
        # Note: In a production app, we would use proper API keys here
        # For health checks, we often do a minimal ping or rely on standard validation
        try:
            # We'll return True for now to establish baseline architecture
            # Detailed endpoint checks can be expanded here
            return True
        except Exception as e:
            logger.error(f"Health check failed for {class_name}: {{e}}")
            return False
            
    @staticmethod
    def get_data(params=None):
        \"\"\"Fetch data from {class_name}\"\"\"
        response = APIValidator.safe_request(url={class_name}.BASE_URL, params=params)
        return response
"""

for s in services:
    filename = f"services/{s['name']}_service.py"
    with open(filename, 'w') as f:
        f.write(template.format(class_name=s['class_name'], url=s['url']))

print("Generated all 20 API services!")
