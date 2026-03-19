from flask import Blueprint, jsonify, request

from supabase_client import get_supabase_client

residents_bp = Blueprint('residents', __name__)

@residents_bp.route("/api/residents", methods=["GET"])
def get_residents():
    try:
        supabase = get_supabase_client(request)
        response = supabase.table("residents").select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": "Impossible de récupérer les résidents."}), 500

@residents_bp.route("/api/residents", methods=["POST"])
def add_resident():
    try:
        supabase = get_supabase_client(request)
        data = request.json
        response = supabase.table("residents").insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"error": "Impossible d'ajouter le résident."}), 500

@residents_bp.route("/api/residents/<string:resident_id>", methods=["DELETE"])
def delete_resident(resident_id):
    try:
        supabase = get_supabase_client(request)
        response = supabase.table("residents").delete().eq("id", resident_id).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": "Impossible de supprimer le résident."}), 500

@residents_bp.route("/api/residents/<string:resident_id>", methods=["PATCH"])
def update_resident(resident_id):
    try:
        supabase = get_supabase_client(request)
        data = request.json
        response = supabase.table("residents").update(data).eq("id", resident_id).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": "Impossible de mettre à jour le résident."}), 500
