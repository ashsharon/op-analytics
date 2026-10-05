def create_metric(client, headers, **overrides):
    payload = {
        "category": "uptime",
        "value": 99.95,
        "recorded_date": "2026-09-01",
        "note": "Nightly maintenance window excluded",
    }
    payload.update(overrides)
    return client.post("/metrics/", json=payload, headers=headers)


def test_admin_can_create_metric(client, admin_headers):
    resp = create_metric(client, admin_headers)
    assert resp.status_code == 201
    assert resp.json()["category"] == "uptime"


def test_viewer_cannot_create_metric(client, admin_headers, viewer_headers):
    resp = create_metric(client, viewer_headers)
    assert resp.status_code == 403


def test_viewer_can_list_metrics(client, admin_headers, viewer_headers):
    create_metric(client, admin_headers)
    resp = client.get("/metrics/", headers=viewer_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_unauthenticated_cannot_list_metrics(client):
    resp = client.get("/metrics/")
    assert resp.status_code == 401


def test_negative_value_rejected(client, admin_headers):
    resp = create_metric(client, admin_headers, value=-5)
    assert resp.status_code == 422


def test_filter_by_category(client, admin_headers):
    create_metric(client, admin_headers, category="uptime")
    create_metric(client, admin_headers, category="error_rate", value=1.2)

    resp = client.get("/metrics/?category=error_rate", headers=admin_headers)
    assert len(resp.json()) == 1
    assert resp.json()[0]["category"] == "error_rate"


def test_summary_aggregates_correctly(client, admin_headers):
    create_metric(client, admin_headers, category="uptime", value=99.0, recorded_date="2026-09-01")
    create_metric(client, admin_headers, category="uptime", value=97.0, recorded_date="2026-09-02")

    resp = client.get("/metrics/summary", headers=admin_headers)
    assert resp.status_code == 200
    uptime_summary = next(s for s in resp.json() if s["category"] == "uptime")
    assert uptime_summary["average"] == 98.0
    assert uptime_summary["count"] == 2


def test_viewer_cannot_delete_metric(client, admin_headers, viewer_headers):
    created = create_metric(client, admin_headers).json()
    resp = client.delete(f"/metrics/{created['id']}", headers=viewer_headers)
    assert resp.status_code == 403


def test_admin_can_delete_metric(client, admin_headers):
    created = create_metric(client, admin_headers).json()
    resp = client.delete(f"/metrics/{created['id']}", headers=admin_headers)
    assert resp.status_code == 204
