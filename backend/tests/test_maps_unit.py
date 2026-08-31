import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.maps_service import search_place, reverse_geocode
from services.routing_service import get_route
from services.poi_service import get_nearby_pois
from services.trip_intelligence_service import get_trip_intelligence

class TestMapServicesUnit(unittest.TestCase):

    @patch('services.maps_service.requests.get')
    def test_forward_geocoding_success(self, mock_get):
        # Mock successful Nominatim response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [{"lat": "19.0760", "lon": "72.8777", "display_name": "Mumbai, India"}]
        mock_get.return_value = mock_response

        # Clear cache first to force request
        import services.maps_service
        services.maps_service._cache = {}

        result = search_place("Mumbai")
        self.assertTrue(result["success"])
        self.assertEqual(result["data"][0]["lat"], "19.0760")
        self.assertEqual(result["data"][0]["display_name"], "Mumbai, India")

    @patch('services.maps_service.requests.get')
    def test_reverse_geocoding_success(self, mock_get):
        # Mock successful Nominatim reverse response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"display_name": "Gateway of India, Mumbai"}
        mock_get.return_value = mock_response

        # Clear cache
        import services.maps_service
        services.maps_service._cache = {}

        result = reverse_geocode(18.9220, 72.8347)
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["display_name"], "Gateway of India, Mumbai")

    @patch('services.routing_service.requests.get')
    def test_routing_success(self, mock_get):
        # Mock successful OSRM response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "code": "Ok",
            "routes": [{"distance": 150000, "duration": 7200, "geometry": {"coordinates": [[72.8, 18.9], [73.8, 18.5]]}}]
        }
        mock_get.return_value = mock_response

        # Clear cache
        import services.routing_service
        services.routing_service._cache = {}

        result = get_route(18.9220, 72.8347, 18.5204, 73.8567)
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["routes"][0]["distance"], 150000)

    @patch('services.poi_service._query_overpass_with_retry')
    def test_poi_search_success(self, mock_query):
        # Mock successful Overpass response
        mock_query.return_value = {
            "elements": [
                {"id": 1, "lat": 18.9, "lon": 72.8, "tags": {"name": "City Hospital", "amenity": "hospital"}}
            ]
        }

        # Clear cache
        import services.poi_service
        services.poi_service._cache = {}

        result = get_nearby_pois(18.9220, 72.8347, 2000, "hospital")
        self.assertTrue(result["success"])
        self.assertEqual(result["data"][0]["name"], "City Hospital")

    def test_caching_mechanism(self):
        # Direct verification of caching
        import services.maps_service
        services.maps_service._cache = {
            "nominatim_reverse_1.0_2.0": ({"display_name": "Cached Place"}, float('inf'))
        }
        result = reverse_geocode(1.0, 2.0)
        self.assertTrue(result["success"])
        self.assertTrue(result["cached"])
        self.assertEqual(result["data"]["display_name"], "Cached Place")

    def test_invalid_coordinates(self):
        # Verify coordination boundary/validation checks
        result = reverse_geocode(None, 2.0)
        self.assertFalse(result["success"])
        self.assertIn("required", result["error"])

if __name__ == "__main__":
    unittest.main()
