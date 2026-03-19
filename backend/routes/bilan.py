from flask import Blueprint, jsonify, request

from supabase_client import get_supabase_client

bilan_bp = Blueprint('bilan', __name__)

@bilan_bp.route("/api/bilan/stats", methods=["GET"])
def get_annual_stats():
    try:
        supabase = get_supabase_client(request)
        # 1. Total Cotisations (Payments)
        payments = supabase.table("payments").select("amount").execute()
        total_payments = sum(p['amount'] for p in payments.data) if payments.data else 0

        # 2. Total Autres Revenus (Extra Revenues)
        extras = supabase.table("extra_revenues").select("amount").execute()
        total_extras = sum(e['amount'] for e in extras.data) if extras.data else 0

        # 3. Total Dépenses (Expenses)
        expenses = supabase.table("expenses").select("amount").execute()
        total_expenses = sum(ex['amount'] for ex in expenses.data) if expenses.data else 0

        # 4. Calcul de la balance
        revenue_total = total_payments + total_extras
        balance = revenue_total - total_expenses

        # 5. Dashboard Specific Stats
        residents_count = supabase.table("residents").select("id", count="exact").execute().count or 0
        
        # Get 5 most recent expenses
        recent_expenses = supabase.table("expenses").select("*").order("date", desc=True).limit(5).execute().data or []
        
        # Get 5 most recent extra revenues
        recent_extras = supabase.table("extra_revenues").select("*").order("date", desc=True).limit(5).execute().data or []

        return jsonify({
            "total_cotisations": total_payments,
            "total_extra": total_extras,
            "total_expenses": total_expenses,
            "total_revenue": revenue_total,
            "balance": balance,
            "residents_count": residents_count,
            "recent_expenses": recent_expenses,
            "recent_extras": recent_extras
        })
    except Exception as e:
        return jsonify({"error": "Impossible de récupérer les statistiques de bilan."}), 500

@bilan_bp.route("/api/reports/charts", methods=["GET"])
def get_charts_data():
    try:
        supabase = get_supabase_client(request)
        from datetime import datetime
        year = request.args.get('year', str(datetime.now().year))
        
        # 1. Monthly Data for revenues and expenses
        # Initialize 12 months array
        monthly_revenues = [0.0] * 12
        monthly_expenses = [0.0] * 12

        # Payments (Cotisations)
        payments_query = supabase.table("payments").select("amount, payment_date").execute()
        if payments_query.data:
            for p in payments_query.data:
                if p.get('payment_date') and p['payment_date'].startswith(year):
                    try:
                        month_idx = int(p['payment_date'].split('-')[1]) - 1
                        monthly_revenues[month_idx] += float(p.get('amount') or 0)
                    except: pass

        # Extra Revenues
        extra_query = supabase.table("extra_revenues").select("amount, date").execute()
        if extra_query.data:
            for e in extra_query.data:
                if e.get('date') and e['date'].startswith(year):
                    try:
                        month_idx = int(e['date'].split('-')[1]) - 1
                        monthly_revenues[month_idx] += float(e.get('amount') or 0)
                    except: pass

        # Expenses
        expenses_query = supabase.table("expenses").select("amount, date, category").execute()
        
        # Breakdown dictionary
        breakdown_categories = {}
        
        if expenses_query.data:
            for ex in expenses_query.data:
                # Add to monthly
                if ex.get('date') and ex['date'].startswith(year):
                    try:
                        month_idx = int(ex['date'].split('-')[1]) - 1
                        monthly_expenses[month_idx] += float(ex.get('amount') or 0)
                    except: pass
                
                # Add to breakdown (we can do it for the selected year or all-time)
                # Let's do it for the selected year
                if ex.get('date') and ex['date'].startswith(year):
                    cat = ex.get('category', 'Divers')
                    amt = float(ex.get('amount') or 0)
                    breakdown_categories[cat] = breakdown_categories.get(cat, 0) + amt

        # Format Categories for Chart
        breakdown_labels = list(breakdown_categories.keys())
        breakdown_data = list(breakdown_categories.values())

        return jsonify({
            "monthly": {
                "revenues": monthly_revenues,
                "expenses": monthly_expenses
            },
            "breakdown": {
                "labels": breakdown_labels,
                "data": breakdown_data
            }
        })
    except Exception as e:
        return jsonify({"error": "Impossible de récupérer les données de graphiques."}), 500
