import time
import sys
import os

# Add parent directory to sys.path to load config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.maps_service import search_place
from services.routing_service import get_route
from services.poi_service import get_nearby_pois

# 5-minute memory cache for trip intelligence queries
_cache = {}
CACHE_EXPIRY_SECONDS = 300

def get_trip_intelligence(origin, destination):
    """
    Orchestration layer that integrates:
    Nominatim (geocoding) + OSRM (routing) + Overpass (POI queries) + Caching.
    Returns a unified trip intelligence response.
    """
    if not origin or not destination:
        return {"success": False, "error": "Origin and destination are required"}

    cache_key = f"trip_intel_{origin.strip().lower()}_{destination.strip().lower()}"
    if cache_key in _cache:
        cached_data, expiry = _cache[cache_key]
        if time.time() < expiry:
            return {"success": True, "cached": True, "data": cached_data}
        else:
            del _cache[cache_key]

    # 1. Geocode origin
    origin_res = search_place(origin)
    if not origin_res.get("success") or not origin_res.get("data"):
        return {"success": False, "error": f"Failed to geocode origin '{origin}': {origin_res.get('error', 'Location not found')}"}
    
    origin_data = origin_res["data"][0]
    origin_lat = float(origin_data["lat"])
    origin_lon = float(origin_data["lon"])

    # 2. Geocode destination
    dest_res = search_place(destination)
    if not dest_res.get("success") or not dest_res.get("data"):
        return {"success": False, "error": f"Failed to geocode destination '{destination}': {dest_res.get('error', 'Location not found')}"}

    dest_data = dest_res["data"][0]
    dest_lat = float(dest_data["lat"])
    dest_lon = float(dest_data["lon"])

    # 3. Get route from OSRM
    route_res = get_route(origin_lat, origin_lon, dest_lat, dest_lon)
    route_data = {}
    
    if route_res.get("success") and route_res.get("data"):
        routes = route_res["data"].get("routes", [])
        if routes:
            best_route = routes[0]
            route_data = {
                "distance": best_route.get("distance", 0),
                "duration": best_route.get("duration", 0),
                "geometry": best_route.get("geometry", {}).get("coordinates", [])
            }

    # 4. Get POIs and EV charging stations around destination
    poi_types = ["hospital", "fuel", "charging_station"]
    nearby_places = []
    charging_stations = []

    for p_type in poi_types:
        poi_res = get_nearby_pois(dest_lat, dest_lon, radius=5000, poi_type=p_type)
        if poi_res.get("success"):
            pois_list = poi_res.get("data", [])
            if p_type == "charging_station":
                charging_stations.extend(pois_list)
            else:
                nearby_places.extend(pois_list)

    # 5. Formulate current location
    current_location = {
        "lat": origin_lat,
        "lon": origin_lon,
        "address": origin_data.get("display_name", "")
    }

    # 6. Format result
    result = {
        "origin": {
            "name": origin_data.get("display_name", origin),
            "lat": origin_lat,
            "lon": origin_lon
        },
        "destination": {
            "name": dest_data.get("display_name", destination),
            "lat": dest_lat,
            "lon": dest_lon
        },
        "route": route_data,
        "nearby_places": nearby_places,
        "charging_stations": charging_stations,
        "current_location": current_location,
        "cache_status": {
            "cached": False,
            "ttl_seconds": CACHE_EXPIRY_SECONDS
        },
        "services": {
            "osrm": "healthy" if route_res.get("success") else "failed",
            "nominatim": "healthy" if origin_res.get("success") and dest_res.get("success") else "failed",
            "overpass": "healthy",
            "gps": "active"
        }
    }

    # Cache successful result
    _cache[cache_key] = (result, time.time() + CACHE_EXPIRY_SECONDS)

    return {"success": True, "cached": False, "data": result}
