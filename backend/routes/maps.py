from flask import Blueprint, request, jsonify
from services.maps_service import search_place, reverse_geocode
from services.routing_service import get_route
from services.poi_service import get_nearby_pois
from services.trip_intelligence_service import get_trip_intelligence

maps_bp = Blueprint("maps", __name__)

@maps_bp.route("/search", methods=["GET"])
def api_search_place():
    query = request.args.get("q")
    if not query:
        return jsonify({"success": False, "error": "Missing query parameter 'q'"}), 400
    
    result = search_place(query)
    status_code = 200 if result.get("success") else 500
    return jsonify(result), status_code

@maps_bp.route("/route", methods=["GET"])
def api_get_route():
    try:
        start_lat = float(request.args.get("start_lat"))
        start_lon = float(request.args.get("start_lon"))
        end_lat = float(request.args.get("end_lat"))
        end_lon = float(request.args.get("end_lon"))
    except (TypeError, ValueError):
        return jsonify({"success": False, "error": "Coordinates must be valid numbers"}), 400

    result = get_route(start_lat, start_lon, end_lat, end_lon)
    status_code = 200 if result.get("success") else 500
    return jsonify(result), status_code

@maps_bp.route("/pois", methods=["GET"])
def api_get_pois():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
        radius = float(request.args.get("radius", 5000))
    except (TypeError, ValueError):
        return jsonify({"success": False, "error": "Latitude, longitude, and radius must be valid numbers"}), 400

    poi_type = request.args.get("type", "hospital")
    result = get_nearby_pois(lat, lon, radius, poi_type)
    status_code = 200 if result.get("success") else 500
    return jsonify(result), status_code

@maps_bp.route("/reverse", methods=["GET"])
def api_reverse_geocode():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
    except (TypeError, ValueError):
        return jsonify({"success": False, "error": "Coordinates must be valid numbers"}), 400

    result = reverse_geocode(lat, lon)
    status_code = 200 if result.get("success") else 500
    return jsonify(result), status_code

@maps_bp.route("/trip-intelligence", methods=["GET"])
def api_trip_intelligence():
    origin = request.args.get("origin")
    destination = request.args.get("destination")
    if not origin or not destination:
        return jsonify({"success": False, "error": "Parameters 'origin' and 'destination' are required"}), 400

    result = get_trip_intelligence(origin, destination)
    status_code = 200 if result.get("success") else 500
    return jsonify(result), status_code

@maps_bp.route("/health", methods=["GET"])
def api_health():
    # Test Nominatim connection
    nominatim_check = search_place("Mumbai")
    nominatim_status = "healthy" if nominatim_check.get("success") else "failed"

    # Test OSRM routing connection
    osrm_check = get_route(18.9220, 72.8347, 18.5204, 73.8567) # Mumbai to Pune
    osrm_status = "healthy" if osrm_check.get("success") else "failed"

    # Test Overpass POI connection
    overpass_check = get_nearby_pois(18.9220, 72.8347, radius=1000, poi_type="hospital")
    overpass_status = "healthy" if overpass_check.get("success") else "failed"

    overall = "healthy" if (nominatim_status == "healthy" and osrm_status == "healthy" and overpass_status == "healthy") else "degraded"

    return jsonify({
        "overall": overall,
        "services": {
            "osrm": {"status": osrm_status},
            "nominatim": {"status": nominatim_status},
            "overpass": {"status": overpass_status},
            "cache": {"status": "healthy"},
            "gps": {"status": "available"}
        }
    }), 200
