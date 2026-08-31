import sys
import os
import requests
import time

# Add parent directory to sys.path to load config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import OSRM_BASE_URL, APP_USER_AGENT

# 5-minute response cache (thread-safe simple memory cache)
_cache = {}
CACHE_EXPIRY_SECONDS = 300

def get_route(start_lat, start_lon, end_lat, end_lon):
    """
    Calculate routes using OpenSource Routing Machine (OSRM) demo server.
    Returns a structured JSON response with error handling, timeout, and caching.
    """
    if start_lat is None or start_lon is None or end_lat is None or end_lon is None:
        return {"success": False, "error": "Start and end coordinates are required"}

    # Check cache
    cache_key = f"osrm_route_{start_lat}_{start_lon}_{end_lat}_{end_lon}"
    if cache_key in _cache:
        cached_data, expiry = _cache[cache_key]
        if time.time() < expiry:
            return {"success": True, "cached": True, "data": cached_data}
        else:
            del _cache[cache_key]

    headers = {
        "User-Agent": APP_USER_AGENT
    }

    # Coordinates format: {lon},{lat};{lon},{lat}
    url = f"{OSRM_BASE_URL}/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}"
    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "true"
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code != 200:
            return {
                "success": False, 
                "error": f"OSRM API returned HTTP status {response.status_code}"
            }
            
        data = response.json()
        
        if data.get("code") != "Ok":
            return {
                "success": False,
                "error": f"OSRM API returned code: {data.get('code')}"
            }

        # Cache successful response
        _cache[cache_key] = (data, time.time() + CACHE_EXPIRY_SECONDS)
        
        return {"success": True, "cached": False, "data": data}
        
    except requests.exceptions.Timeout:
        return {"success": False, "error": "OSRM routing request timed out (10s)"}
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": f"Request failed: {str(e)}"}
