import os
from typing import Optional

from flask import Request
from supabase import create_client, Client
from supabase.lib.client_options import SyncClientOptions as ClientOptions


SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")


def get_supabase_client(request: Optional[Request] = None) -> Client:
    """
    Retourne un client Supabase.

    - Si un header Authorization est présent sur la requête (JWT Supabase),
      il est propagé au client pour que les policies RLS s'appliquent avec
      l'utilisateur connecté.
    - Sinon, on garde le comportement actuel (clé anon).
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise RuntimeError("SUPABASE_URL ou SUPABASE_ANON_KEY manquant dans l'environnement.")

    options: Optional[ClientOptions] = None

    if request is not None:
        auth_header = request.headers.get("Authorization")
        if auth_header:
            options = ClientOptions()
            # On laisse _get_auth_headers compléter apiKey, mais on force Authorization.
            options.headers["Authorization"] = auth_header

    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY, options=options)

