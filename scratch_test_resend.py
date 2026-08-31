import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

try:
    print("Testing Resend API Key...")
    # Send a quick test email to the user to prove it works
    r = resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": "abhaypratapdh1234@gmail.com",
        "subject": "Resend API Test",
        "html": "<strong>If you see this, the Resend API key is 1000% working!</strong>"
    })
    print(f"✅ SUCCESS: Email sent! Response: {r}")
except Exception as e:
    print(f"❌ FAILURE: Resend API is NOT working. Error: {e}")
