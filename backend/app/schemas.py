from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from .models import MetricCategory, Role


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: Role

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MetricEntryCreate(BaseModel):
    category: MetricCategory
    value: float = Field(ge=0)
    recorded_date: date
    note: Optional[str] = Field(default=None, max_length=280)


class MetricEntryOut(BaseModel):
    id: int
    category: MetricCategory
    value: float
    recorded_date: date
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class MetricSummary(BaseModel):
    category: MetricCategory
    average: float
    minimum: float
    maximum: float
    count: int
