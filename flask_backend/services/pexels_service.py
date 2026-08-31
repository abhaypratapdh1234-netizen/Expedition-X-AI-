from utils.api_validator import APIValidator, logger

class PexelsService:
    BASE_URL = "https://api.pexels.com/v1/search"
    
    @staticmethod
    def get_headers():
        api_key = APIValidator.get_api_key("PEXELS_API_KEY")
        return {"Authorization": api_key} if api_key else {}

    @staticmethod
    def check_health():
        """Verify if the PexelsService API is accessible by making a tiny request."""
        try:
            # We fetch 1 photo of 'nature' to check if the key is valid
            headers = PexelsService.get_headers()
            if not headers.get("Authorization"):
                return False
            
            response = APIValidator.safe_request(
                url=PexelsService.BASE_URL, 
                headers=headers,
                params={"query": "nature", "per_page": 1}
            )
            return response.get("success", False)
        except Exception as e:
            logger.error(f"Health check failed for PexelsService: {e}")
            return False
            
    @staticmethod
    def get_data(params=None):
        """Fetch data from PexelsService"""
        headers = PexelsService.get_headers()
        response = APIValidator.safe_request(url=PexelsService.BASE_URL, headers=headers, params=params)
        return response
