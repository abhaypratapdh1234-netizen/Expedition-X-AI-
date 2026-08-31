import os
import requests
import logging
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class APIValidator:
    @staticmethod
    def get_api_key(key_name, fallback=None):
        """Retrieve API key from environment, optionally with a fallback."""
        key = os.getenv(key_name, fallback)
        if not key:
            logger.warning(f"API Key {key_name} is missing.")
        return key

    @staticmethod
    def safe_request(url, method="GET", headers=None, params=None, json_data=None, timeout=10, max_retries=3):
        """Execute an API request with retries, timeout, and error handling."""
        attempt = 0
        while attempt < max_retries:
            try:
                response = requests.request(
                    method=method,
                    url=url,
                    headers=headers,
                    params=params,
                    json=json_data,
                    timeout=timeout
                )
                
                # Check for rate limiting
                if response.status_code == 429:
                    logger.warning(f"Rate limited by {url}. Retrying in {2 ** attempt} seconds...")
                    time.sleep(2 ** attempt)
                    attempt += 1
                    continue
                
                response.raise_for_status() # Raise HTTPError for bad responses (4xx and 5xx)
                
                return {
                    "success": True,
                    "data": response.json() if response.content else None,
                    "status_code": response.status_code
                }
            except requests.exceptions.Timeout:
                logger.error(f"Timeout connecting to {url}")
            except requests.exceptions.HTTPError as e:
                logger.error(f"HTTP Error {e.response.status_code} for {url}: {e.response.text}")
                return {"success": False, "error": str(e), "status_code": e.response.status_code}
            except requests.exceptions.RequestException as e:
                logger.error(f"Request failed for {url}: {e}")
            
            attempt += 1
            time.sleep(1) # simple backoff
            
        return {"success": False, "error": "Max retries exceeded", "status_code": 500}
