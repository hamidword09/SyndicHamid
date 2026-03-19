from flask import Blueprint, jsonify, request
from supabase_client import get_supabase_client

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route("/api/expenses", methods=["GET"])
def get_expenses():
    try:
        supabase = get_supabase_client(request)
        response = supabase.table("expenses").select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": "Impossible de récupérer les dépenses."}), 500

@expenses_bp.route("/api/expenses", methods=["POST"])
def add_expense():
    try:
        supabase = get_supabase_client(request)
        data = request.json
        response = supabase.table("expenses").insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"error": "Impossible d'ajouter la dépense."}), 500

@expenses_bp.route("/api/expenses/<id>", methods=["DELETE"])
def delete_expense(id):
    try:
        supabase = get_supabase_client(request)
        response = supabase.table("expenses").delete().eq("id", id).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": "Impossible de supprimer la dépense."}), 500
