from flask import Blueprint, jsonify, request
from supabase_client import get_supabase_client

extra_revenues_bp = Blueprint('extra_revenues', __name__)

@extra_revenues_bp.route("/api/extra_revenues", methods=["GET"])
def get_extra_revenues():
    try:
        supabase = get_supabase_client(request)
        response = supabase.table("extra_revenues").select("*").order("date", desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": "Impossible de récupérer les autres revenus."}), 500

@extra_revenues_bp.route("/api/extra_revenues", methods=["POST"])
def add_extra_revenue():
    try:
        supabase = get_supabase_client(request)
        data = request.json
        response = supabase.table("extra_revenues").insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"error": "Impossible d'ajouter l'autre revenu."}), 500

@extra_revenues_bp.route("/api/extra_revenues/<id>", methods=["DELETE"])
def delete_extra_revenue(id):
    try:
        supabase = get_supabase_client(request)
        response = supabase.table("extra_revenues").delete().eq("id", id).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": "Impossible de supprimer l'autre revenu."}), 500
