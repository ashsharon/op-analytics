def test_first_registered_user_becomes_admin(client):
    resp = client.post(
        "/auth/register",
        json={"email": "first@example.com", "password": "securepass1", "full_name": "First User"},
    )
    assert resp.status_code == 201
    assert resp.json()["role"] == "admin"


def test_second_registered_user_is_viewer(client):
    client.post(
        "/auth/register",
        json={"email": "first2@example.com", "password": "securepass1", "full_name": "First"},
    )
    resp = client.post(
        "/auth/register",
        json={"email": "second@example.com", "password": "securepass1", "full_name": "Second"},
    )
    assert resp.json()["role"] == "viewer"


def test_login_rate_limit_blocks_after_max_attempts(client):
    client.post(
        "/auth/register",
        json={"email": "ratelimit@example.com", "password": "securepass1", "full_name": "RL User"},
    )
    # 5 failed attempts are allowed, the 6th should be rate limited.
    for _ in range(5):
        resp = client.post(
            "/auth/login", data={"username": "ratelimit@example.com", "password": "wrongpass"}
        )
        assert resp.status_code == 401

    resp = client.post(
        "/auth/login", data={"username": "ratelimit@example.com", "password": "wrongpass"}
    )
    assert resp.status_code == 429


def test_security_headers_present(client):
    resp = client.get("/health")
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["X-Frame-Options"] == "DENY"
