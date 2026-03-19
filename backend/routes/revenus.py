from flask import Blueprint, jsonify, request
from supabase_client import get_supabase_client

revenus_bp = Blueprint('revenus', __name__)

@revenus_bp.route("/api/revenus", methods=["GET"])
def get_revenus():
    try:
        supabase = get_supabase_client(request)
        response = supabase.table("payments").select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": "Impossible de récupérer les cotisations."}), 500

@revenus_bp.route("/api/revenus", methods=["POST"])
def add_revenu():
    try:
        supabase = get_supabase_client(request)
        data = request.json

        # Sécurité : un résident ne doit jamais pouvoir choisir un autre `resident_id`.
        # On l'injecte côté backend à partir de son JWT (via la table `residents`).
        #
        # Admin: on laisse passer la donnée telle quelle (RLS admin l'autorise).
        auth_header = request.headers.get("Authorization", "")
        token = ""
        if auth_header.lower().startswith("bearer "):
            token = auth_header[7:].strip()
        else:
            token = auth_header.strip()

        user_response = supabase.auth.get_user(jwt=token) if token else None
        user = getattr(user_response, "user", None) if user_response else None
        role = None
        if user:
            role = (getattr(user, "app_metadata", {}) or {}).get("role") or (getattr(user, "user_metadata", {}) or {}).get("role")

        if role != "admin":
            # Récupère le résident correspondant à l'utilisateur connecté
            user_id = getattr(user, "id", None) if user else None
            if not user_id:
                return jsonify({"error": "Accès interdit."}), 403

            resident_rows = supabase.table("residents").select("id").eq("user_id", user_id).limit(1).execute()
            if not resident_rows.data:
                return jsonify({"error": "Accès interdit."}), 403
            data["resident_id"] = resident_rows.data[0]["id"]

        response = supabase.table("payments").insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"error": "Impossible d'ajouter la cotisation."}), 500

@revenus_bp.route("/api/revenus/<string:rev_id>", methods=["DELETE"])
def delete_revenu(rev_id):
    try:
        supabase = get_supabase_client(request)
        response = supabase.table("payments").delete().eq("id", rev_id).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": "Impossible de supprimer la cotisation."}), 500

@revenus_bp.route("/api/revenus/<string:rev_id>", methods=["PATCH"])
def update_revenu(rev_id):
    try:
        supabase = get_supabase_client(request)
        data = request.json
        response = supabase.table("payments").update(data).eq("id", rev_id).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": "Impossible de mettre à jour la cotisation."}), 500
