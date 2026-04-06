from fastapi.testclient import TestClient
from main import app
import os

client = TestClient(app)

def test_upload():
    file_path = r"d:\Work\Learning\Complain_Tools\Sample_File_KPI.csv"
    if not os.path.exists(file_path):
        print("Sample file not found. Skipping test.")
        return

    with open(file_path, "rb") as f:
        response = client.post(
            "/api/upload_kpi",
            files={"file": ("Sample_File_KPI.csv", f, "text/csv")}
        )
    
    print("STATUS CODE:", response.status_code)
    try:
        data = response.json()
        print("KEYS:", list(data.keys()))
        print("MESSAGE:", data.get("message"))
        print("TOTAL COLUMNS:", len(data.get("columns", [])))
        print("FIRST ROW SAMPLE:", data.get("sample_data", [])[0] if data.get("sample_data") else None)
    except Exception as e:
        print("FAILED TO PARSE RESPONSE:", response.text)

if __name__ == "__main__":
    test_upload()
