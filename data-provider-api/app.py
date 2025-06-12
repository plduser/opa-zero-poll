
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/companies/<tenant_id>", methods=["GET"])
def get_company_data(tenant_id):
    data = {
        "companies": [
            {"company_id": f"company_{tenant_id}_1", "users": ["user1", "user2"]},
            {"company_id": f"company_{tenant_id}_2", "users": ["user3", "user4"]}
        ]
    }
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8100)
