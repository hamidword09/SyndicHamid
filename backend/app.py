import os
from dotenv import load_dotenv

# D'abord charger les variables d'environnement !
load_dotenv()

from flask import Flask, jsonify, request
from flask_cors import CORS

from routes.revenus import revenus_bp
from routes.residents import residents_bp
from routes.expenses import expenses_bp
from routes.extra_revenues import extra_revenues_bp
from routes.bilan import bilan_bp
from routes.repairs import repairs_bp
from routes.maintenance import maintenance_bp
from routes.voting import voting_bp

app = Flask(__name__)

# CORS : on restreint aux origines nécessaires (par défaut le front local).
frontend_origins = os.environ.get("FRONTEND_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]

CORS(
    app,
    resources={r"/api/*": {"origins": allowed_origins}},
    supports_credentials=True,
    allow_headers=["Authorization", "Content-Type"],
)

app.register_blueprint(revenus_bp)
app.register_blueprint(residents_bp)
app.register_blueprint(expenses_bp)
app.register_blueprint(extra_revenues_bp)
app.register_blueprint(bilan_bp)
app.register_blueprint(repairs_bp)
app.register_blueprint(maintenance_bp)
app.register_blueprint(voting_bp)

@app.route("/")
def home():
    return jsonify({"status": "Syndic Gravity Backend is running"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
