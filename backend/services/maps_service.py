import sys
import os
import requests
import time

# Add parent directory to sys.path to load config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import NOMINATIM_BASE_URL, APP_USER_AGENT

# 5-minute response cache (thread-safe simple memory cache)
_cache = {}
CACHE_EXPIRY_SECONDS = 300

def _autocorrect_query_via_wikipedia(query):
    """
    Query Wikipedia's Search API to find autocorrected titles for queries with typos.
    """
    try:
        url = "https://en.wikipedia.org/w/api.php"
        headers = {
            "User-Agent": APP_USER_AGENT
        }
        params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "utf8": 1
        }
        r = requests.get(url, headers=headers, params=params, timeout=5)
        if r.status_code == 200:
            res_json = r.json()
            search_results = res_json.get("query", {}).get("search", [])
            if search_results:
                return search_results[0].get("title")
    except Exception as e:
        print(f"Wikipedia autocorrect query failed: {str(e)}")
    return None

def search_place(query):
    """
    Search places using Nominatim OpenStreetMap API.
    Returns a structured JSON response with error handling, timeout, and caching.
    """
    if not query:
        return {"success": False, "error": "Query parameter is required"}

    # Check cache
    cache_key = f"nominatim_{query.strip().lower()}"
    if cache_key in _cache:
        cached_data, expiry = _cache[cache_key]
        if time.time() < expiry:
            return {"success": True, "cached": True, "data": cached_data}
        else:
            del _cache[cache_key]

    headers = {
        "User-Agent": APP_USER_AGENT,
        "Accept-Language": "en"
    }
    
    url = f"{NOMINATIM_BASE_URL}/search"
    params = {
        "q": query,
        "format": "json",
        "limit": 10,
        "addressdetails": 1
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code != 200:
            return {
                "success": False, 
                "error": f"Nominatim API returned HTTP status {response.status_code}"
            }
            
        data = response.json()

        # If no results are found, attempt Wikipedia spelling autocorrect fallback
        if not data and query.strip():
            corrected_query = _autocorrect_query_via_wikipedia(query.strip())
            if corrected_query and corrected_query.lower() != query.strip().lower():
                print(f"Nominatim returned empty results for '{query}'. Wikipedia autocorrected to '{corrected_query}'. Retrying Nominatim search.")
                params["q"] = corrected_query
                retry_response = requests.get(url, headers=headers, params=params, timeout=10)
                if retry_response.status_code == 200:
                    data = retry_response.json()
        
        # Cache successful response
        _cache[cache_key] = (data, time.time() + CACHE_EXPIRY_SECONDS)
        
        return {"success": True, "cached": False, "data": data}
        
    except requests.exceptions.Timeout:
        return {"success": False, "error": "Nominatim request timed out (10s)"}
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": f"Request failed: {str(e)}"}

def reverse_geocode(lat, lon):
    """
    Reverse geocode coordinates using Nominatim OpenStreetMap API.
    Returns address details.
    """
    if lat is None or lon is None:
        return {"success": False, "error": "Latitude and longitude are required"}

    # Check cache
    cache_key = f"nominatim_reverse_{lat}_{lon}"
    if cache_key in _cache:
        cached_data, expiry = _cache[cache_key]
        if time.time() < expiry:
            return {"success": True, "cached": True, "data": cached_data}
        else:
            del _cache[cache_key]

    headers = {
        "User-Agent": APP_USER_AGENT,
        "Accept-Language": "en"
    }
    
    url = f"{NOMINATIM_BASE_URL}/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
        "addressdetails": 1
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code != 200:
            return {
                "success": False, 
                "error": f"Nominatim API returned HTTP status {response.status_code}"
            }
            
        data = response.json()
        
        # Cache successful response
        _cache[cache_key] = (data, time.time() + CACHE_EXPIRY_SECONDS)
        
        return {"success": True, "cached": False, "data": data}
        
    except requests.exceptions.Timeout:
        return {"success": False, "error": "Nominatim request timed out (10s)"}
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": f"Request failed: {str(e)}"}
