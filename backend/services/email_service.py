import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
# Strip out whitespace from the app password, just in case
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").replace(" ", "")
SMTP_FROM = os.getenv("SMTP_FROM")
APP_NAME = os.getenv("APP_NAME", "ExpeditionX")

def send_otp_email(to_email, otp):
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

        print(f"OTP email sent to {to_email}")
        return True

    except Exception as e:
        print(f"Email sending failed: {e}")
        return False
