from flask import Flask, jsonify
from flask_cors import CORS
from routes.auth import auth_bp
from routes.maps import maps_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(maps_bp, url_prefix="/api/maps")

@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ExpeditionX Python Flask Service"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)

