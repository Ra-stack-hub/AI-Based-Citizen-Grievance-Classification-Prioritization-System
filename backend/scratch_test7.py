from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

from app.database.connection import connect_to_mongo
import asyncio

async def test_admin_login_and_fetch():
    await connect_to_mongo()
    # Login
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@smartcity.gov", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    print("Login status:", response.status_code)
    if response.status_code != 200:
        print("Login response:", response.json())
        return

    token = response.json()["access_token"]
    print("Got token:", token[:10] + "...")

    # Fetch all complaints
    response2 = client.get(
        "/api/v1/complaints/all",
        headers={"Authorization": f"Bearer {token}"}
    )
    print("Fetch /all status:", response2.status_code)
    if response2.status_code != 200:
        print("Fetch error:", response2.json())

if __name__ == "__main__":
    asyncio.run(test_admin_login_and_fetch())
