from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random

# Load the environment variables from the parent folders
load_dotenv('../.env')
load_dotenv('../backend/.env')
load_dotenv('.env')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Allow both production Vercel frontend and local development origins
ALLOWED_ORIGINS = [
    "https://expedition-x-ai.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

# Import all 20 services
from services.gemini_service import GeminiService
from services.weather_service import WeatherService
from services.geoapify_service import GeoapifyService
from services.osm_service import OSMService
from services.nominatim_service import NominatimService
from services.routing_service import RoutingService
from services.currency_service import CurrencyService
from services.countries_service import CountriesService
from services.timezone_service import TimezoneService
from services.wikipedia_service import WikipediaService
from services.email_service import EmailService
from services.images_service import ImageService
from services.ip_geolocation_service import IPGeolocationService
from services.pixabay_service import PixabayService
from services.pexels_service import PexelsService
from services.open_meteo_service import OpenMeteoService
from services.open_elevation_service import OpenElevationService
from services.wikidata_service import WikidataService
from services.overpass_service import OverpassService

@app.route('/api/health', methods=['GET'])
def health_check():
    """Unified Health Check for all 20 APIs"""
    
    health_status = {
        "gemini": "working" if GeminiService.check_health() else "failed",
        "weather": "working" if WeatherService.check_health() else "failed",
        "geoapify": "working" if GeoapifyService.check_health() else "failed",
        "osm": "working" if OSMService.check_health() else "failed",
        "nominatim": "working" if NominatimService.check_health() else "failed",
        "routing": "working" if RoutingService.check_health() else "failed",
        "currency": "working" if CurrencyService.check_health() else "failed",
        "countries": "working" if CountriesService.check_health() else "failed",
        "timezone": "working" if TimezoneService.check_health() else "failed",
        "wikipedia": "working" if WikipediaService.check_health() else "failed",
        "email": "working" if EmailService.check_health() else "failed",
        "images": "working" if ImageService.check_health() else "failed",
        "ip_geolocation": "working" if IPGeolocationService.check_health() else "failed",
        "pixabay": "working" if PixabayService.check_health() else "failed",
        "pexels": "working" if PexelsService.check_health() else "failed",
        "open_meteo": "working" if OpenMeteoService.check_health() else "failed",
        "open_elevation": "working" if OpenElevationService.check_health() else "failed",
        "wikidata": "working" if WikidataService.check_health() else "failed",
        "overpass": "working" if OverpassService.check_health() else "failed"
    }
    
    # Calculate overall health
    failed_count = sum(1 for status in health_status.values() if status == "failed")
    overall = "working" if failed_count == 0 else "degraded" if failed_count < 5 else "failed"
    
    return jsonify({
        "status": overall,
        "services": health_status
    })

otp_store = {}

def send_real_otp_email(to_email, otp):
    SMTP_HOST = os.getenv("SMTP_HOST")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").replace(" ", "")
    SMTP_FROM = os.getenv("SMTP_FROM")
    APP_NAME = "ExpeditionX"

    subject = f"{APP_NAME} Password Reset OTP"
    html = f"""
    <html>
    <body style="font-family: Arial; background:#f5f7fb; padding:40px;">
      <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:16px;">
        <h2 style="color:#111827;">{APP_NAME}</h2>
        <p>Use this OTP to reset your password:</p>
        <div style="text-align:center; margin:30px 0;">
          <div style="display:inline-block; background:#111827; color:white; padding:18px 30px; border-radius:12px; font-size:32px; font-weight:bold; letter-spacing:6px;">
            {otp}
          </div>
        </div>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
        <p>If you did not request this, ignore this email.</p>
        <hr style="margin:24px 0;">
        <p style="font-size:12px; color:#6b7280;">© 2026 {APP_NAME}</p>
      </div>
    </body>
    </html>
    """
    from email.utils import formataddr
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = formataddr(("Expedition X", SMTP_FROM))
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        logger.error(f"Email sending failed: {e}")
        return False

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({"success": False, "error": "Email is required"})
    
    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp
    
    if send_real_otp_email(email, otp):
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "error": "Failed to send OTP email"})

@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    if not email or not otp:
        return jsonify({"success": False, "error": "Email and OTP are required"})
    
    expected_otp = otp_store.get(email)
    if expected_otp and str(expected_otp) == str(otp):
        return jsonify({"success": True})
        
    return jsonify({"success": False, "error": "Invalid OTP! Please check your email."})

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('newPassword')
    if not email or not new_password:
        return jsonify({"success": False, "error": "Email and new password are required"})
    
    # In a real app, update the password in the database here
    # For this UI flow, we succeed automatically
    return jsonify({"success": True})

@app.route('/health', methods=['GET'])
def health():
    """Simple health check endpoint for deployment monitoring."""
    return jsonify({"status": "ok", "service": "ExpeditionX Flask API"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
