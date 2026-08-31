import pytest
import sys
import os

# Ensure the parent directory is in the path so we can import app and services
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from utils.api_validator import APIValidator

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check_endpoint(client):
    """Test that the unified health check endpoint returns 200 OK and valid JSON."""
    response = client.get('/api/health')
    assert response.status_code == 200
    
    data = response.get_json()
    assert "status" in data
    assert "services" in data
    
    # Verify we have exactly 19 services listed in the response
    assert len(data["services"]) == 19
    
    # Check that Gemini is present
    assert "gemini" in data["services"]

def test_api_validator_missing_key():
    """Test the API Validator fallback mechanism for missing keys."""
    # Temporarily remove a key if it exists
    original = os.environ.get("FAKE_TEST_KEY")
    if "FAKE_TEST_KEY" in os.environ:
        del os.environ["FAKE_TEST_KEY"]
        
    val = APIValidator.get_api_key("FAKE_TEST_KEY", fallback="fallback_value")
    assert val == "fallback_value"
    
    if original is not None:
        os.environ["FAKE_TEST_KEY"] = original

def test_api_validator_safe_request():
    """Test the safe_request method against a known stable open API."""
    # We use a reliable, no-auth endpoint like RestCountries for a basic test
    result = APIValidator.safe_request("https://api.github.com/users/octocat")
    assert result["success"] is True
    assert result["status_code"] == 200
    assert isinstance(result["data"], dict)
    assert result["data"]["login"] == "octocat"
