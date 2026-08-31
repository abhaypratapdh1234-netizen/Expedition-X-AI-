import os
import sys
from dotenv import load_dotenv

# Load env variables from root .env if running from flask_backend
load_dotenv('../.env')

# Add the flask_backend directory to sys.path so we can import services
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.pexels_service import PexelsService

def run_tests():
    print("=========================================")
    print("   Pexels API - 20 Deep Test Cases       ")
    print("=========================================\n")
    
    passed_tests = 0
    total_tests = 20

    def assert_test(test_name, condition, error_msg=""):
        nonlocal passed_tests
        if condition:
            print(f"[PASS] {test_name}")
            passed_tests += 1
        else:
            print(f"[FAIL] {test_name} - {error_msg}")

    # Test 1: Health Check
    print("--- Basic Connectivity & Health ---")
    is_healthy = PexelsService.check_health()
    assert_test("Test 1: check_health() returns True", is_healthy, "Health check failed")

    # Helper function for searching
    def search(params):
        return PexelsService.get_data(params=params)

    print("\n--- Basic Searches ---")
    
    # Test 2: Standard search
    res2 = search({"query": "nature"})
    assert_test("Test 2: Basic search 'nature'", res2.get("success") and "photos" in res2.get("data", {}), res2.get("error"))

    # Test 3: Search another term
    res3 = search({"query": "city"})
    assert_test("Test 3: Basic search 'city'", res3.get("success") and len(res3.get("data", {}).get("photos", [])) > 0, "No photos found")

    # Test 4: Search with spaces
    res4 = search({"query": "new york city"})
    assert_test("Test 4: Search with multiple words 'new york city'", res4.get("success"), res4.get("error"))

    print("\n--- Pagination ---")
    
    # Test 5: Custom per_page (1)
    res5 = search({"query": "ocean", "per_page": 1})
    assert_test("Test 5: per_page=1", res5.get("success") and len(res5.get("data", {}).get("photos", [])) == 1, f"Expected 1 photo, got {len(res5.get('data', {}).get('photos', [])) if res5.get('data') else 'None'}")

    # Test 6: Custom per_page (5)
    res6 = search({"query": "forest", "per_page": 5})
    assert_test("Test 6: per_page=5", res6.get("success") and len(res6.get("data", {}).get("photos", [])) <= 5, "Too many photos returned")

    # Test 7: Page 2
    res7 = search({"query": "mountain", "page": 2, "per_page": 1})
    assert_test("Test 7: Pagination (page=2)", res7.get("success") and res7.get("data", {}).get("page") == 2, "Page number mismatch")

    # Test 8: Large page number
    res8 = search({"query": "sky", "page": 100, "per_page": 1})
    assert_test("Test 8: Large page number (page=100)", res8.get("success") and res8.get("data", {}).get("page") == 100, "Failed to retrieve page 100")

    print("\n--- Filters: Color ---")
    
    # Test 9: Color filter (red)
    res9 = search({"query": "car", "color": "red"})
    assert_test("Test 9: Color filter 'red'", res9.get("success"), res9.get("error"))

    # Test 10: Color filter (blue)
    res10 = search({"query": "house", "color": "blue"})
    assert_test("Test 10: Color filter 'blue'", res10.get("success"), res10.get("error"))

    # Test 11: Invalid color filter (should typically ignore or return valid response with empty or fallback results)
    res11 = search({"query": "car", "color": "notacolor123"})
    assert_test("Test 11: Invalid color filter handling", res11.get("status_code") in [200, 400], "Unexpected status code for invalid color")

    print("\n--- Filters: Orientation ---")
    
    # Test 12: Orientation landscape
    res12 = search({"query": "beach", "orientation": "landscape", "per_page": 1})
    assert_test("Test 12: Orientation 'landscape'", res12.get("success"), res12.get("error"))

    # Test 13: Orientation portrait
    res13 = search({"query": "person", "orientation": "portrait", "per_page": 1})
    assert_test("Test 13: Orientation 'portrait'", res13.get("success"), res13.get("error"))

    # Test 14: Orientation square
    res14 = search({"query": "food", "orientation": "square", "per_page": 1})
    assert_test("Test 14: Orientation 'square'", res14.get("success"), res14.get("error"))

    print("\n--- Filters: Size ---")

    # Test 15: Size large
    res15 = search({"query": "building", "size": "large", "per_page": 1})
    assert_test("Test 15: Size 'large'", res15.get("success"), res15.get("error"))

    # Test 16: Size small
    res16 = search({"query": "cat", "size": "small", "per_page": 1})
    assert_test("Test 16: Size 'small'", res16.get("success"), res16.get("error"))

    print("\n--- Filters: Locale ---")

    # Test 17: Locale en-US
    res17 = search({"query": "dog", "locale": "en-US", "per_page": 1})
    assert_test("Test 17: Locale 'en-US'", res17.get("success"), res17.get("error"))

    # Test 18: Locale pt-BR (Portuguese)
    res18 = search({"query": "cachorro", "locale": "pt-BR", "per_page": 1})
    assert_test("Test 18: Locale 'pt-BR'", res18.get("success"), res18.get("error"))

    print("\n--- Edge Cases ---")

    # Test 19: Missing query parameter (Pexels requires a query for /search)
    res19 = search({})
    assert_test("Test 19: Missing query (Should return 400 Bad Request)", not res19.get("success") and res19.get("status_code") == 400, f"Expected 400, got {res19.get('status_code')}")

    # Test 20: Complex query (all params)
    res20 = search({"query": "flower", "color": "yellow", "orientation": "square", "size": "small", "page": 1, "per_page": 1})
    assert_test("Test 20: Complex query with multiple filters", res20.get("success"), res20.get("error"))

    print(f"\n=========================================")
    print(f"   Results: {passed_tests}/{total_tests} Tests Passed")
    print(f"=========================================")
    
    if passed_tests == total_tests:
        print("SUCCESS! The Pexels API is working perfectly.")
    else:
        print("WARNING: Some tests failed. Please review the errors above.")

if __name__ == "__main__":
    run_tests()
