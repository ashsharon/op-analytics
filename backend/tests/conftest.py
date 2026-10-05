import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ["DATABASE_URL"] = "sqlite:///./test_ops_dashboard.db"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.rate_limit import reset_rate_limits

TEST_DATABASE_URL = "sqlite:///./test_ops_dashboard.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    reset_rate_limits()
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    return TestClient(app)


def _register_and_login(client, email, password="testpass123", full_name="Test User"):
    client.post("/auth/register", json={"email": email, "password": password, "full_name": full_name})
    resp = client.post("/auth/login", data={"username": email, "password": password})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client):
    # First registered user automatically becomes admin.
    return _register_and_login(client, "admin@example.com")


@pytest.fixture
def viewer_headers(client, admin_headers):
    # Register the admin first (via the fixture above), then a second user is a viewer.
    return _register_and_login(client, "viewer@example.com")
