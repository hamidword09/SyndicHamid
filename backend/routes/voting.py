from flask import Blueprint, jsonify, request

from supabase_client import get_supabase_client

voting_bp = Blueprint('voting', __name__)

@voting_bp.route("/api/polls", methods=["GET"])
def get_polls():
    try:
        supabase = get_supabase_client(request)
        # Get polls with options and vote count
        polls = supabase.table("polls").select("*, poll_options(*), poll_votes(option_id)").execute().data
        
        # Format data: count votes per option
        for poll in polls:
            votes = poll.pop('poll_votes', [])
            options = poll.get('poll_options', [])
            total_votes = len(votes)
            poll['total_votes'] = total_votes
            
            for opt in options:
                opt_votes = sum(1 for v in votes if v['option_id'] == opt['id'])
                opt['votes_count'] = opt_votes
                opt['percentage'] = (opt_votes / total_votes * 100) if total_votes > 0 else 0
                
        return jsonify(polls)
    except Exception as e:
        return jsonify({"error": "Impossible de récupérer les sondages."}), 500

@voting_bp.route("/api/polls", methods=["POST"])
def create_poll():
    try:
        supabase = get_supabase_client(request)
        data = request.json
        # Create poll
        poll_res = supabase.table("polls").insert({
            "title": data.get("title"),
            "description": data.get("description"),
            "expires_at": data.get("expires_at"),
            "status": "active"
        }).execute()
        
        if not poll_res.data:
            return jsonify({"error": "Failed to create poll"}), 500
            
        poll_id = poll_res.data[0]['id']
        options = data.get("options", []) # List of labels
        
        if options:
            opts_data = [{"poll_id": poll_id, "label": label} for label in options]
            supabase.table("poll_options").insert(opts_data).execute()
            
        return jsonify(poll_res.data[0]), 201
    except Exception as e:
        return jsonify({"error": "Impossible de créer le sondage."}), 500

@voting_bp.route("/api/polls/<id>/vote", methods=["POST"])
def cast_vote(id):
    try:
        supabase = get_supabase_client(request)
        data = request.json
        option_id = data.get("option_id")
        resident_id = data.get("resident_id")
        
        if not option_id or not resident_id:
            return jsonify({"error": "Missing option or resident"}), 400
            
        # Check if already voted
        already = supabase.table("poll_votes").select("id").eq("poll_id", id).eq("resident_id", resident_id).execute()
        if already.data:
            return jsonify({"error": "Vous avez déjà voté pour ce sondage"}), 400
            
        res = supabase.table("poll_votes").insert({
            "poll_id": id,
            "option_id": option_id,
            "resident_id": resident_id
        }).execute()
        
        return jsonify(res.data[0]), 201
    except Exception as e:
        return jsonify({"error": "Impossible d'enregistrer le vote."}), 500
