import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

class SupabaseLite:
    def __init__(self):
        if SUPABASE_URL.startswith("postgresql://"):
            project_id = SUPABASE_URL.split("@db.")[1].split(".supabase.co")[0]
            self.base_url = f"https://{project_id}.supabase.co/rest/v1"
        else:
            self.base_url = f"{SUPABASE_URL}/rest/v1"
            
        self.headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
        }
        self.params = {}
        self._not = False

    def table(self, table_name):
        self.current_table = table_name
        self.params = {}
        self._not = False
        return self

    def select(self, columns="*"):
        self.params["select"] = columns
        return self

    def eq(self, column, value):
        prefix = "not.eq." if self._not else "eq."
        self.params[column] = f"{prefix}{value}"
        self._not = False
        return self

    def not_(self):
        self._not = True
        return self

    def is_(self, column, value):
        prefix = "not.is." if self._not else "is."
        self.params[column] = f"{prefix}{value}"
        self._not = False
        return self

    def update(self, data):
        self._method = "PATCH"
        self._data = data
        return self

    def upsert(self, data, on_conflict=None):
        self._method = "UPSERT"
        self._data = data
        return self

    def execute(self):
        url = f"{self.base_url}/{self.current_table}"
        headers = self.headers.copy()
        
        method = getattr(self, "_method", "GET")
        
        if method == "UPSERT":
            headers["Prefer"] = "resolution=merge-duplicates,return=representation"
            res = httpx.post(url, json=self._data, headers=headers, params=self.params)
        elif method == "PATCH":
            headers["Prefer"] = "return=representation"
            res = httpx.patch(url, json=self._data, headers=headers, params=self.params)
        else:
            res = httpx.get(url, headers=headers, params=self.params)
        
        # Reset state
        if hasattr(self, "_method"): del self._method
        if hasattr(self, "_data"): del self._data
        
        # Cek jika error
        data = res.json()
        if res.status_code >= 400:
            print(f"Database Error ({res.status_code}): {data}")
            data = [] # Berikan list kosong agar loop tidak error
        
        class Response:
            def __init__(self, data):
                self.data = data
        
        return Response(data)

supabase = SupabaseLite()
