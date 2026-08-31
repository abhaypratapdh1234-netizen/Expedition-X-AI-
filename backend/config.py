import os
from dotenv import load_dotenv

# Load variables from environment
load_dotenv()
# Also try to load from the parent folder (for development setup where .env is at workspace root)
load_dotenv("../.env")

# Centralized configuration variables for free map and routing services
OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org").rstrip("/")
NOMINATIM_BASE_URL = os.getenv("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org").rstrip("/")
OVERPASS_BASE_URL = os.getenv("OVERPASS_BASE_URL", "https://overpass-api.de/api/interpreter").rstrip("/")

MAP_PROVIDER = os.getenv("MAP_PROVIDER", "openstreetmap")
ENABLE_LIVE_GPS = os.getenv("ENABLE_LIVE_GPS", "true").lower() == "true"
ENABLE_OFFLINE_CACHE = os.getenv("ENABLE_OFFLINE_CACHE", "true").lower() == "true"
ENABLE_TRIP_INTELLIGENCE = os.getenv("ENABLE_TRIP_INTELLIGENCE", "true").lower() == "true"

APP_USER_AGENT = os.getenv("APP_USER_AGENT", "ExpeditionX/1.0 (contact: expeditionx@example.com)")
