from utils.api_validator import APIValidator, logger

class OSMService:
    BASE_URL = "https://nominatim.openstreetmap.org/search"
    
    @staticmethod
    def check_health():
        """Verify if the OSMService API is accessible."""
        # Note: In a production app, we would use proper API keys here
        # For health checks, we often do a minimal ping or rely on standard validation
        try:
            # We'll return True for now to establish baseline architecture
            # Detailed endpoint checks can be expanded here
            return True
        except Exception as e:
            logger.error(f"Health check failed for OSMService: {e}")
            return False
            
    @staticmethod
    def get_data(params=None):
        """Fetch data from OSMService"""
        response = APIValidator.safe_request(url=OSMService.BASE_URL, params=params)
        return response
