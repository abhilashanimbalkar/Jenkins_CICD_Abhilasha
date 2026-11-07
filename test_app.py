import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import app  # noqa: E402


def client():
    app.config.update(TESTING=True)
    return app.test_client()


def test_index():
    r = client().get("/")
    assert r.status_code == 200
    assert r.get_json()["service"] == "flask-backend"


def test_health():
    r = client().get("/api/health")
    assert r.status_code == 200
    assert r.get_json()["status"] == "healthy"


def test_message():
    r = client().get("/api/message")
    assert r.status_code == 200
    assert "Flask" in r.get_json()["message"]


def test_config_status_without_key(monkeypatch):
    monkeypatch.delenv("API_KEY", raising=False)
    assert client().get("/api/config-status").get_json() == {"api_key_configured": False}


def test_config_status_with_key(monkeypatch):
    monkeypatch.setenv("API_KEY", "dummy")
    assert client().get("/api/config-status").get_json() == {"api_key_configured": True}
