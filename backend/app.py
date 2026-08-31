from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.maps import maps_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(maps_bp, url_prefix="/api/maps")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
