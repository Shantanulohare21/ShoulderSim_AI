"""
Biomechanical Simulation API Routes
Handles ROM simulation, FEA, and muscle force calculations
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import uuid
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.database import Simulation, Scan, SimulationStatus, SimulationType
from app.tasks.celery_app import celery_app

router = APIRouter()

# Pydantic models
class ROMSimulationRequest(BaseModel):
    scan_id: str
    abduction_range: tuple = (0, 180)
    flexion_range: tuple = (0, 180)
    rotation_range: tuple = (-90, 90)
    resolution_degrees: int = 1

class FEASimulationRequest(BaseModel):
    scan_id: str
    loading_scenario: str  # "arm_elevation", "overhead_press"
    load_kg: float = 5.0
    material_properties: Optional[dict] = None

class MuscleForceRequest(BaseModel):
    scan_id: str
    movement_type: str  # "abduction", "flexion", "rotation"

class SimulationResponse(BaseModel):
    job_id: str
    status: str
    message: str

class SimulationStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: float
    result_url: Optional[str]

@router.post("/rom", response_model=SimulationResponse)
async def trigger_rom_simulation(
    request: ROMSimulationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_role("surgeon")),
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger Range of Motion simulation
    Simulates shoulder movement across specified ranges
    """
    # Verify scan exists
    result = await db.execute(select(Scan).where(Scan.id == request.scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Create simulation record
    job_id = str(uuid.uuid4())
    simulation = Simulation(
        id=job_id,
        scan_id=request.scan_id,
        type=SimulationType.ROM,
        params_json=request.dict(),
        status=SimulationStatus.PENDING
    )
    db.add(simulation)
    await db.commit()
    
    # Trigger Celery task
    from app.tasks.simulation import run_rom_simulation
    run_rom_simulation.delay(job_id, request.dict())
    
    return SimulationResponse(
        job_id=job_id,
        status="pending",
        message="ROM simulation started"
    )

@router.post("/fea", response_model=SimulationResponse)
async def trigger_fea_simulation(
    request: FEASimulationRequest,
    current_user: dict = Depends(require_role("surgeon")),
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger Finite Element Analysis
    Computes stress/strain distribution on bone and implant
    """
    # Verify scan exists
    result = await db.execute(select(Scan).where(Scan.id == request.scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Create simulation record
    job_id = str(uuid.uuid4())
    simulation = Simulation(
        id=job_id,
        scan_id=request.scan_id,
        type=SimulationType.FEA,
        params_json=request.dict(),
        status=SimulationStatus.PENDING
    )
    db.add(simulation)
    await db.commit()
    
    # Trigger Celery task
    from app.tasks.simulation import run_fea_simulation
    run_fea_simulation.delay(job_id, request.dict())
    
    return SimulationResponse(
        job_id=job_id,
        status="pending",
        message="FEA simulation started"
    )

@router.post("/muscle-forces", response_model=SimulationResponse)
async def trigger_muscle_force_simulation(
    request: MuscleForceRequest,
    current_user: dict = Depends(require_role("surgeon")),
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger muscle force simulation
    Computes muscle activation and force contributions
    """
    # Verify scan exists
    result = await db.execute(select(Scan).where(Scan.id == request.scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Create simulation record
    job_id = str(uuid.uuid4())
    simulation = Simulation(
        id=job_id,
        scan_id=request.scan_id,
        type=SimulationType.MUSCLE_FORCES,
        params_json=request.dict(),
        status=SimulationStatus.PENDING
    )
    db.add(simulation)
    await db.commit()
    
    # Trigger Celery task
    from app.tasks.simulation import run_muscle_force_simulation
    run_muscle_force_simulation.delay(job_id, request.dict())
    
    return SimulationResponse(
        job_id=job_id,
        status="pending",
        message="Muscle force simulation started"
    )

@router.get("/{job_id}/status", response_model=SimulationStatusResponse)
async def get_simulation_status(
    job_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get simulation job status"""
    result = await db.execute(select(Simulation).where(Simulation.id == job_id))
    simulation = result.scalar_one_or_none()
    
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    # Get Celery task status
    task = celery_app.AsyncResult(job_id)
    
    progress_map = {
        SimulationStatus.PENDING: 0.0,
        SimulationStatus.RUNNING: 50.0,
        SimulationStatus.COMPLETED: 100.0,
        SimulationStatus.FAILED: 0.0
    }
    
    return SimulationStatusResponse(
        job_id=job_id,
        status=simulation.status.value,
        progress=progress_map.get(simulation.status, 0.0),
        result_url=simulation.result_s3_key if simulation.status == SimulationStatus.COMPLETED else None
    )

@router.get("/{job_id}/results")
async def get_simulation_results(
    job_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get full simulation results"""
    result = await db.execute(select(Simulation).where(Simulation.id == job_id))
    simulation = result.scalar_one_or_none()
    
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    if simulation.status != SimulationStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Simulation not completed")
    
    # In production, this would load results from S3
    return {
        "job_id": job_id,
        "type": simulation.type.value,
        "params": simulation.params_json,
        "results": "Results loaded from S3",
        "duration_seconds": simulation.duration_seconds
    }
