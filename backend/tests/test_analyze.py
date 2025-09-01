# backend/tests/test_analyze.py
from fastapi.testclient import TestClient
from typing import Any, Optional, Union
import importlib.util
from app.main import app

client = TestClient(app)


def _maybe_monkeypatch_call_model(monkeypatch):
    """
    Try to patch app.services.analyzer.call_model if it exists; otherwise noop.
    Adjust the module path below if your Watsonx call lives elsewhere.
    """
    mod_spec = importlib.util.find_spec("app.services.analyzer")
    if mod_spec is None:
        return
    mod = importlib.util.module_from_spec(mod_spec)
    assert mod_spec.loader is not None
    mod_spec.loader.exec_module(mod)  # type: ignore[attr-defined]

    def fake_call_model(prompt: str):
        return {
            "insight": "Net positive cash flow with major inflows from invoices.",
            "raw": "Net positive cash flow with major inflows from invoices.",
        }

    # If your route imported it like `from app.services.analyzer import call_model`,
    # you may also need to patch the route module—uncomment and adjust as needed:
    # route_mod = importlib.import_module("app.routes.analyze")
    # monkeypatch.setattr(route_mod, "call_model", fake_call_model, raising=False)

    monkeypatch.setattr(mod, "call_model", fake_call_model, raising=False)


def _extract_message(data: Any, fallback_text: str) -> Optional[str]:
    """
    Try to pull a human-readable message from common shapes:
      - {"insight": "..."} or {"summary": "..."} or {"raw": "..."} or {"message": "..."}
      - {"data": {...}} nesting any of the above
      - plain text body (fallback_text)
    """
    if isinstance(data, dict):
        # flat keys
        for k in ("insight", "summary", "raw", "message"):
            v = data.get(k)
            if isinstance(v, str) and v.strip():
                return v.strip()
        # nested under "data"
        d = data.get("data")
        if isinstance(d, dict):
            for k in ("insight", "summary", "raw", "message"):
                v = d.get(k)
                if isinstance(v, str) and v.strip():
                    return v.strip()
    # fallback to raw text body
    if isinstance(fallback_text, str) and fallback_text.strip():
        return fallback_text.strip()
    return None


def test_analyze_happy_path(monkeypatch):
    _maybe_monkeypatch_call_model(monkeypatch)

    payload = {
        "text": (
            "Cash in 3500 and 4200 from invoices; cash out 1200 rent and 180 SaaS. "
            "Net positive cash flow overall."
        )
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 200, res.text

    # Try JSON first; if not JSON, fall back to text
    data: Union[dict, None]
    try:
        data = res.json()
    except Exception:
        data = None
    msg = _extract_message(data, res.text)

    assert isinstance(msg, str) and len(msg) > 0, f"Unexpected response shape: JSON={data!r}, text={res.text!r}"


def test_analyze_bad_input():
    # Missing required 'text' should trigger validation error
    res = client.post("/api/analyze", json={})
    assert res.status_code in (400, 422)