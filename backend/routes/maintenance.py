from flask import Blueprint, jsonify, request
import random
from datetime import datetime
from supabase_client import get_supabase_client

maintenance_bp = Blueprint('maintenance', __name__)

@maintenance_bp.route("/api/maintenance", methods=["GET"])
def get_maintenance():
    try:
        supabase = get_supabase_client(request)
        # Join with residents to see who reported
        response = supabase.table("maintenance") \
            .select("*, residents(name, apt)") \
            .order("created_at", desc=True) \
            .execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": "Impossible de récupérer la maintenance."}), 500

@maintenance_bp.route("/api/maintenance", methods=["POST"])
def add_maintenance():
    try:
        supabase = get_supabase_client(request)
        data = request.json
        year = datetime.now().year
        rand_id = random.randint(100, 999)
        ticket_id = f"MNT-{year}-{rand_id}"
        
        insert_data = {
            "ticket_id": ticket_id,
            "title": data.get("title"),
            "category": data.get("category"),
            "description": data.get("description"),
            "status": "pending",
            "resident_id": data.get("resident_id") # Can be null
        }
        
        response = supabase.table("maintenance").insert(insert_data).execute()
        return jsonify(response.data[0]), 201
    except Exception as e:
        return jsonify({"error": "Impossible de créer le ticket de maintenance."}), 500

@maintenance_bp.route("/api/maintenance/<id>/status", methods=["PATCH"])
def update_maintenance_status(id):
    try:
        supabase = get_supabase_client(request)
        data = request.json
        new_status = data.get("status")
        if new_status not in ['pending', 'in-progress', 'resolved']:
            return jsonify({"error": "Invalid status"}), 400
            
        response = supabase.table("maintenance").update({"status": new_status}).eq("id", id).execute()
        return jsonify(response.data[0])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
