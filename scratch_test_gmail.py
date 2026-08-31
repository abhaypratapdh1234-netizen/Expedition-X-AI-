import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from services.email_service import send_otp_email

try:
    print("Testing Gmail SMTP configuration...")
    success = send_otp_email("abhaypratapdh1234@gmail.com", "999999")
    if success:
        print("✅ SUCCESS: Gmail SMTP is 1000% working! Email sent.")
    else:
        print("❌ FAILURE: send_otp_email returned False.")
except Exception as e:
    print(f"❌ FAILURE: Exception occurred: {e}")
