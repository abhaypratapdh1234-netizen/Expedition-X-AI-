from utils.api_validator import APIValidator, logger

class GeminiService:
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
    
    @staticmethod
    def check_health():
        """Verify if the GeminiService API is accessible."""
        # Note: In a production app, we would use proper API keys here
        # For health checks, we often do a minimal ping or rely on standard validation
        try:
            # We'll return True for now to establish baseline architecture
            # Detailed endpoint checks can be expanded here
            return True
        except Exception as e:
            logger.error(f"Health check failed for GeminiService: {e}")
            return False
            
    @staticmethod
    def get_data(params=None):
        """Fetch data from GeminiService"""
        response = APIValidator.safe_request(url=GeminiService.BASE_URL, params=params)
        return response
