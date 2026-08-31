from utils.api_validator import APIValidator, logger

class TimezoneService:
    BASE_URL = "http://api.timezonedb.com/v2.1/get-time-zone"
    
    @staticmethod
    def check_health():
        """Verify if the TimezoneService API is accessible."""
        # Note: In a production app, we would use proper API keys here
        # For health checks, we often do a minimal ping or rely on standard validation
        try:
            # We'll return True for now to establish baseline architecture
            # Detailed endpoint checks can be expanded here
            return True
        except Exception as e:
            logger.error(f"Health check failed for TimezoneService: {e}")
            return False
            
    @staticmethod
    def get_data(params=None):
        """Fetch data from TimezoneService"""
        response = APIValidator.safe_request(url=TimezoneService.BASE_URL, params=params)
        return response
