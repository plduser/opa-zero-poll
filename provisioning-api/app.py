
from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)
OPAL_SERVER_URL = os.getenv("OPAL_SERVER_URL", "http://opal-server:7002")

@app.route("/provision-tenant", methods=["POST"])
def provision_tenant():
    data = request.json
    tenant_id = data["tenant_id"]
    source = {
        "url": f"http://data-provider-api:8100/companies/{tenant_id}",
        "topics": [f"access.companies.{tenant_id}"],
        "dst_path": f"access.companies.{tenant_id}",
        "polling_interval_seconds": 0
    }
    r = requests.post(f"{OPAL_SERVER_URL}/data-sources", json=source)
    return jsonify(r.json()), r.status_code

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
