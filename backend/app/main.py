from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import auth_router, metrics_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ops Analytics Dashboard",
    description="Internal dashboard for tracking system metrics (uptime, response time, "
    "error rate, throughput) with role-based access: viewers can read, admins can write.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    # Basic hardening headers — not a substitute for a proper WAF/CDN config,
    # but the kind of baseline an internal admin tool should ship with.
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


app.include_router(auth_router.router)
app.include_router(metrics_router.router)


@app.get("/health", tags=["meta"])
def health_check():
    return {"status": "ok"}
