from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.post("/", response_model=schemas.MetricEntryOut, status_code=status.HTTP_201_CREATED)
def create_metric(
    payload: schemas.MetricEntryCreate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.require_admin),
):
    entry = models.MetricEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/", response_model=List[schemas.MetricEntryOut])
def list_metrics(
    category: Optional[models.MetricCategory] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    _user: models.User = Depends(auth.get_current_user),  # any authenticated role can view
):
    query = db.query(models.MetricEntry)
    if category:
        query = query.filter(models.MetricEntry.category == category)
    if start_date:
        query = query.filter(models.MetricEntry.recorded_date >= start_date)
    if end_date:
        query = query.filter(models.MetricEntry.recorded_date <= end_date)
    return query.order_by(models.MetricEntry.recorded_date.asc()).all()


@router.get("/summary", response_model=List[schemas.MetricSummary])
def summary(
    db: Session = Depends(get_db),
    _user: models.User = Depends(auth.get_current_user),
):
    rows = (
        db.query(
            models.MetricEntry.category,
            func.avg(models.MetricEntry.value),
            func.min(models.MetricEntry.value),
            func.max(models.MetricEntry.value),
            func.count(models.MetricEntry.id),
        )
        .group_by(models.MetricEntry.category)
        .all()
    )
    return [
        schemas.MetricSummary(category=cat, average=round(avg, 2), minimum=mn, maximum=mx, count=cnt)
        for cat, avg, mn, mx, cnt in rows
    ]


@router.delete("/{metric_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_metric(
    metric_id: int,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.require_admin),
):
    entry = db.query(models.MetricEntry).filter(models.MetricEntry.id == metric_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Metric entry not found")
    db.delete(entry)
    db.commit()
