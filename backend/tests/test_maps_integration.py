import sys
import os
import unittest

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.maps_service import search_place, reverse_geocode
from services.routing_service import get_route
from services.poi_service import get_nearby_pois
from services.trip_intelligence_service import get_trip_intelligence

class TestMapServicesIntegration(unittest.TestCase):

    def test_live_nominatim_forward(self):
        # Clear cache first to force live call
        import services.maps_service
        services.maps_service._cache = {}

        result = search_place("Mumbai")
        self.assertTrue(result["success"])
        self.assertGreater(len(result["data"]), 0)
        self.assertIn("Mumbai", result["data"][0]["display_name"])

    def test_live_nominatim_reverse(self):
        # Clear cache
        import services.maps_service
        services.maps_service._cache = {}

        result = reverse_geocode(18.9220, 72.8347)
        self.assertTrue(result["success"])
        self.assertIn("Mumbai", result["data"]["display_name"])

    def test_live_osrm_routing(self):
        # Clear cache
        import services.routing_service
        services.routing_service._cache = {}

        result = get_route(18.9220, 72.8347, 18.5204, 73.8567) # Mumbai to Pune
        self.assertTrue(result["success"])
        self.assertGreater(result["data"]["routes"][0]["distance"], 100000)

    def test_live_overpass_pois(self):
        # Clear cache
        import services.poi_service
        services.poi_service._cache = {}

        result = get_nearby_pois(18.9220, 72.8347, 2000, "hospital")
        self.assertTrue(result["success"])
        self.assertGreater(len(result["data"]), 0)

    def test_live_trip_intelligence(self):
        # Clear cache
        import services.trip_intelligence_service
        services.trip_intelligence_service._cache = {}

        result = get_trip_intelligence("Mumbai", "Pune")
        self.assertTrue(result["success"])
        data = result["data"]
        self.assertIn("Mumbai", data["origin"]["name"])
        self.assertIn("Pune", data["destination"]["name"])
        self.assertGreater(data["route"]["distance"], 100000)
        self.assertGreater(len(data["nearby_places"]), 0)

if __name__ == "__main__":
    unittest.main()
