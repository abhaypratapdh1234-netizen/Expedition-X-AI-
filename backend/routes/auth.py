from flask import Blueprint, request, jsonify
from services.email_service import send_otp_email
from models.otp_store import otp_storage
import random
import time

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    otp = str(random.randint(100000, 999999))

    # Store OTP with expiry
    otp_storage[email] = {
        "otp": otp,
        "expires": time.time() + 600  # 10 minutes
    }

    sent = send_otp_email(email, otp)

    if not sent:
        return jsonify({"error": "Failed to send OTP. Check SMTP credentials."}), 500

    return jsonify({
        "success": True,
        "message": "OTP sent successfully"
    })

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")

    record = otp_storage.get(email)

    if not record:
        return jsonify({"error": "OTP not found"}), 400

    if time.time() > record["expires"]:
        return jsonify({"error": "OTP expired"}), 400

    if record["otp"] != otp:
        return jsonify({"error": "Invalid OTP"}), 400

    return jsonify({
        "success": True,
        "message": "OTP verified successfully"
    })
