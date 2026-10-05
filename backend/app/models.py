import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Date
from .database import Base


class Role(str, enum.Enum):
    VIEWER = "viewer"
    ADMIN = "admin"


class MetricCategory(str, enum.Enum):
    UPTIME = "uptime"
    RESPONSE_TIME = "response_time"
    ERROR_RATE = "error_rate"
    THROUGHPUT = "throughput"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(Role), default=Role.VIEWER, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class MetricEntry(Base):
    __tablename__ = "metric_entries"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(Enum(MetricCategory), nullable=False, index=True)
    value = Column(Float, nullable=False)
    recorded_date = Column(Date, nullable=False, index=True)
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
