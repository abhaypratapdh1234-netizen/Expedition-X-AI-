import sys
import os

# Add parent directory to sys.path to load config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.maps_service import search_place, reverse_geocode
from services.routing_service import get_route
from services.poi_service import get_nearby_pois
from services.trip_intelligence_service import get_trip_intelligence

def run_tests():
    print("=" * 60)
    print("EXPEDITIONX MAP & ROUTING LIVE API CONNECTIVITY TEST")
    print("=" * 60)

    # 1. Nominatim Connectivity
    print("\n[1] Testing Nominatim Geocoding...")
    nominatim_res = search_place("Mumbai")
    if nominatim_res.get("success") and nominatim_res.get("data"):
        data = nominatim_res["data"][0]
        print(f"    PASS: Located Mumbai at lat={data.get('lat')}, lon={data.get('lon')}")
    else:
        print(f"    FAIL: Nominatim failed to locate Mumbai. Error: {nominatim_res.get('error')}")

    # 2. Nominatim Reverse Geocoding
    print("\n[2] Testing Nominatim Reverse Geocoding...")
    reverse_res = reverse_geocode(18.9220, 72.8347)
    if reverse_res.get("success") and reverse_res.get("data"):
        address = reverse_res["data"].get("display_name")
        print(f"    PASS: Resolved coordinates to address: {address[:60]}...")
    else:
        print(f"    FAIL: Nominatim reverse geocoding failed. Error: {reverse_res.get('error')}")

    # 3. OSRM Connectivity
    print("\n[3] Testing OSRM Driving Route...")
    osrm_res = get_route(18.9220, 72.8347, 18.5204, 73.8567)
    if osrm_res.get("success") and osrm_res.get("data"):
        routes = osrm_res["data"].get("routes", [])
        if routes:
            route = routes[0]
            print(f"    PASS: Route calculated. Distance={route.get('distance')}m, Duration={route.get('duration')}s")
        else:
            print("    FAIL: OSRM route response had no routes.")
    else:
        print(f"    FAIL: OSRM routing failed. Error: {osrm_res.get('error')}")

    # 4. Overpass POI Connectivity
    print("\n[4] Testing Overpass POI Search...")
    overpass_res = get_nearby_pois(18.9220, 72.8347, radius=2000, poi_type="hospital")
    if overpass_res.get("success") and overpass_res.get("data"):
        pois = overpass_res["data"]
        print(f"    PASS: Found {len(pois)} hospitals nearby. Note: {overpass_res.get('note', 'Live data')}")
    else:
        print(f"    FAIL: Overpass POI search failed. Error: {overpass_res.get('error')}")

    # 5. Offline Cache Test
    print("\n[5] Testing Offline Caching...")
    search_place("Goa")
    cache_res = search_place("Goa")
    if cache_res.get("cached"):
        print("    PASS: Cache HIT. Subsequent request returned from local memory cache.")
    else:
        print("    FAIL: Cache MISS. Subsequent request did not return from cache.")

    # 6. Trip Intelligence Orchestration Test
    print("\n[6] Testing Trip Intelligence Orchestrator...")
    intel_res = get_trip_intelligence("Mumbai", "Pune")
    if intel_res.get("success") and intel_res.get("data"):
        data = intel_res["data"]
        print(f"    PASS: Orchestrated trip details successfully compiled.")
        print(f"          Origin: {data['origin']['name'][:40]}...")
        print(f"          Destination: {data['destination']['name'][:40]}...")
        print(f"          Route Distance: {data['route'].get('distance')} meters")
        print(f"          Nearby POIs Count: {len(data.get('nearby_places', []))}")
        print(f"          EV Stations Count: {len(data.get('charging_stations', []))}")
    else:
        print(f"    FAIL: Orchestrator failed. Error: {intel_res.get('error')}")

    print("\n" + "=" * 60)
    print("TEST EXECUTION COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
