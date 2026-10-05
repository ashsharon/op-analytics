"""
Minimal in-memory fixed-window rate limiter.

For a production deployment this should be backed by Redis (so it works across
multiple server processes/instances), but an in-process limiter is enough to
demonstrate the pattern and to actually block brute-force login attempts in a
single-instance deployment.
"""
import time
from collections import defaultdict

from fastapi import HTTPException, Request, status

WINDOW_SECONDS = 60
MAX_ATTEMPTS = 5

_attempts: dict[str, list[float]] = defaultdict(list)


def enforce_rate_limit(request: Request, bucket: str = "default") -> None:
    client_ip = request.client.host if request.client else "unknown"
    key = f"{bucket}:{client_ip}"
    now = time.time()

    attempts = [t for t in _attempts[key] if now - t < WINDOW_SECONDS]
    if len(attempts) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many attempts. Try again in {WINDOW_SECONDS} seconds.",
        )

    attempts.append(now)
    _attempts[key] = attempts


def reset_rate_limits() -> None:
    """Test helper — clears all tracked attempts."""
    _attempts.clear()
