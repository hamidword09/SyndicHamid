from flask import Blueprint, jsonify, request
from datetime import datetime
from supabase_client import get_supabase_client

repairs_bp = Blueprint('repairs', __name__)

@repairs_bp.route("/api/repairs", methods=["GET"])
def get_repairs():
    try:
        supabase = get_supabase_client(request)
        response = supabase.table("repairs").select("*").order("created_at", desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": "Impossible de récupérer les réparations."}), 500

@repairs_bp.route("/api/repairs", methods=["POST"])
def add_repair():
    try:
        supabase = get_supabase_client(request)
        data = request.json
        # Create project
        response = supabase.table("repairs").insert({
            "title": data.get("title"),
            "description": data.get("description"),
            "budget": data.get("budget"),
            "icon": data.get("icon", "hammer"),
            "status": "pending"
        }).execute()
        
        if not response.data:
            return jsonify({"error": "Failed to create project"}), 500
            
        project_id = response.data[0]['id']
        budget = data.get("budget")
        
        # Get all residents to create contributions
        residents = supabase.table("residents").select("id").execute()
        if residents.data:
            part_amount = budget / len(residents.data)
            contributions = [
                {
                    "repair_id": project_id,
                    "resident_id": res['id'],
                    "amount": part_amount,
                    "paid": False
                } for res in residents.data
            ]
            supabase.table("repair_contributions").insert(contributions).execute()
            
        return jsonify(response.data[0]), 201
    except Exception as e:
        return jsonify({"error": "Impossible de créer la réparation."}), 500

@repairs_bp.route("/api/repairs/<id>/contributions", methods=["GET"])
def get_repair_contributions(id):
    try:
        supabase = get_supabase_client(request)
        # Join with residents to get names and apts
        response = supabase.table("repair_contributions") \
            .select("*, residents(name, apt)") \
            .eq("repair_id", id) \
            .execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": "Impossible de récupérer les contributions."}), 500

@repairs_bp.route("/api/repairs/contributions/<id>/pay", methods=["POST"])
def pay_contribution(id):
    try:
        supabase = get_supabase_client(request)
        # Mark as paid
        res = supabase.table("repair_contributions").update({
            "paid": True,
            "paid_date": datetime.now().strftime("%Y-%m-%d")
        }).eq("id", id).execute()
        
        if not res.data:
            return jsonify({"error": "Contribution not found"}), 404
            
        # Update project 'collected' amount
        contrib = res.data[0]
        project_id = contrib['repair_id']
        amount = contrib['amount']
        
        project = supabase.table("repairs").select("collected").eq("id", project_id).execute()
        if project.data:
            new_collected = (project.data[0].get('collected') or 0) + float(amount)
            supabase.table("repairs").update({"collected": new_collected}).eq("id", project_id).execute()
            
        return jsonify(res.data[0]), 200
    except Exception as e:
        return jsonify({"error": "Impossible de valider le paiement."}), 500
