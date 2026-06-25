"""
Regulatory Compliance API Routes
Handles risk management, adverse events, and usability studies per IEC 62304, ISO 14971, IEC 62366
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
from datetime import datetime
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.database import RiskItem, AdverseEvent, UsabilitySession, TestCase

router = APIRouter()

# Pydantic models
class RiskItemCreate(BaseModel):
    hazard: str
    hazardous_situation: str
    harm: str
    probability: int  # 1-5 scale
    severity: int  # 1-5 scale
    mitigation_desc: str
    test_case_id: Optional[str] = None

class RiskItemResponse(BaseModel):
    id: str
    hazard: str
    hazardous_situation: str
    harm: str
    probability: int
    severity: int
    risk_level: str
    mitigation_desc: str
    residual_risk: Optional[int]
    status: str

class AdverseEventCreate(BaseModel):
    event_type: str
    severity: str
    description: str
    linked_plan_id: Optional[str] = None

class AdverseEventResponse(BaseModel):
    id: str
    report_date: datetime
    event_type: str
    severity: str
    description: str
    status: str

class UsabilitySessionCreate(BaseModel):
    participant_role: str
    task_id: str
    outcome: str
    errors_observed: Optional[List[dict]] = None
    time_to_complete_seconds: Optional[int] = None
    notes: Optional[str] = None
    session_type: Optional[str] = "formative"

class UsabilitySessionResponse(BaseModel):
    id: str
    date: datetime
    participant_role: str
    task_id: str
    outcome: str
    time_to_complete_seconds: Optional[int]

@router.post("/risks", response_model=RiskItemResponse)
async def create_risk_item(
    risk: RiskItemCreate,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new risk item per ISO 14971
    Only accessible by admin users
    """
    # Calculate risk level
    risk_score = risk.probability * risk.severity
    if risk_score >= 20:
        risk_level = "CRITICAL"
    elif risk_score >= 12:
        risk_level = "HIGH"
    elif risk_score >= 6:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    
    risk_item = RiskItem(
        id=str(uuid.uuid4()),
        hazard=risk.hazard,
        hazardous_situation=risk.hazardous_situation,
        harm=risk.harm,
        probability=risk.probability,
        severity=risk.severity,
        risk_level=risk_level,
        mitigation_desc=risk.mitigation_desc,
        test_case_id=risk.test_case_id
    )
    db.add(risk_item)
    await db.commit()
    
    return RiskItemResponse(
        id=risk_item.id,
        hazard=risk_item.hazard,
        hazardous_situation=risk_item.hazardous_situation,
        harm=risk_item.harm,
        probability=risk_item.probability,
        severity=risk_item.severity,
        risk_level=risk_item.risk_level,
        mitigation_desc=risk_item.mitigation_desc,
        residual_risk=risk_item.residual_risk,
        status=risk_item.status
    )

@router.get("/risks", response_model=List[RiskItemResponse])
async def list_risk_items(
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all risk items with optional filters"""
    query = select(RiskItem)
    
    if status:
        query = query.where(RiskItem.status == status)
    if risk_level:
        query = query.where(RiskItem.risk_level == risk_level)
    
    result = await db.execute(query)
    risks = result.scalars().all()
    
    return [
        RiskItemResponse(
            id=risk.id,
            hazard=risk.hazard,
            hazardous_situation=risk.hazardous_situation,
            harm=risk.harm,
            probability=risk.probability,
            severity=risk.severity,
            risk_level=risk.risk_level,
            mitigation_desc=risk.mitigation_desc,
            residual_risk=risk.residual_risk,
            status=risk.status
        )
        for risk in risks
    ]

@router.post("/adverse-events", response_model=AdverseEventResponse)
async def report_adverse_event(
    event: AdverseEventCreate,
    current_user: dict = Depends(require_role("surgeon")),
    db: AsyncSession = Depends(get_db)
):
    """
    Report an adverse event for post-market surveillance
    FDA MedWatch and EU EUDAMED compatible
    """
    adverse_event = AdverseEvent(
        id=str(uuid.uuid4()),
        event_type=event.event_type,
        severity=event.severity,
        description=event.description,
        linked_plan_id=event.linked_plan_id,
        reporter_id=current_user["user_id"]
    )
    db.add(adverse_event)
    await db.commit()
    
    return AdverseEventResponse(
        id=adverse_event.id,
        report_date=adverse_event.report_date,
        event_type=adverse_event.event_type,
        severity=adverse_event.severity,
        description=adverse_event.description,
        status=adverse_event.status
    )

@router.get("/adverse-events", response_model=List[AdverseEventResponse])
async def list_adverse_events(
    status: Optional[str] = None,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """List all adverse events (admin only)"""
    query = select(AdverseEvent)
    
    if status:
        query = query.where(AdverseEvent.status == status)
    
    result = await db.execute(query)
    events = result.scalars().all()
    
    return [
        AdverseEventResponse(
            id=event.id,
            report_date=event.report_date,
            event_type=event.event_type,
            severity=event.severity,
            description=event.description,
            status=event.status
        )
        for event in events
    ]

@router.post("/usability-sessions", response_model=UsabilitySessionResponse)
async def create_usability_session(
    session: UsabilitySessionCreate,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """
    Record a usability study session per IEC 62366
    Used for formative and summative validation studies
    """
    usability_session = UsabilitySession(
        id=str(uuid.uuid4()),
        participant_role=session.participant_role,
        task_id=session.task_id,
        outcome=session.outcome,
        errors_observed=session.errors_observed,
        time_to_complete_seconds=session.time_to_complete_seconds,
        notes=session.notes,
        session_type=session.session_type
    )
    db.add(usability_session)
    await db.commit()
    
    return UsabilitySessionResponse(
        id=usability_session.id,
        date=usability_session.date,
        participant_role=usability_session.participant_role,
        task_id=usability_session.task_id,
        outcome=usability_session.outcome,
        time_to_complete_seconds=usability_session.time_to_complete_seconds
    )

@router.get("/usability-sessions", response_model=List[UsabilitySessionResponse])
async def list_usability_sessions(
    session_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List usability study sessions"""
    query = select(UsabilitySession)
    
    if session_type:
        query = query.where(UsabilitySession.session_type == session_type)
    
    result = await db.execute(query)
    sessions = result.scalars().all()
    
    return [
        UsabilitySessionResponse(
            id=session.id,
            date=session.date,
            participant_role=session.participant_role,
            task_id=session.task_id,
            outcome=session.outcome,
            time_to_complete_seconds=session.time_to_complete_seconds
        )
        for session in sessions
    ]
