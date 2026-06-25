"""
DICOM Scan API Routes
Handles DICOM upload, processing, and segmentation
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
import os
from datetime import datetime
import aiofiles
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.database import Scan, Patient, ScanStatus, AnatomyModel, TissueType
from app.core.config import settings
import boto3
from botocore.client import Config

router = APIRouter()

# S3/MinIO client
s3_client = boto3.client(
    's3',
    endpoint_url=settings.S3_ENDPOINT_URL,
    aws_access_key_id=settings.S3_ACCESS_KEY,
    aws_secret_access_key=settings.S3_SECRET_KEY,
    config=Config(signature_version='s3v4'),
    region_name='us-east-1'
)

# Pydantic models
class ScanUploadResponse(BaseModel):
    scan_id: str
    status: str
    message: str

class ScanStatusResponse(BaseModel):
    scan_id: str
    status: str
    progress: float
    message: Optional[str]

class MeshListResponse(BaseModel):
    scan_id: str
    meshes: List[dict]

@router.post("/upload", response_model=ScanUploadResponse)
async def upload_dicom(
    background_tasks: BackgroundTasks,
    patient_id: str,
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(require_role("surgeon")),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload DICOM series for processing
    Accepts multiple DICOM files as multipart upload
    """
    # Verify patient exists
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Create scan record
    scan_id = str(uuid.uuid4())
    scan = Scan(
        id=scan_id,
        patient_id=patient_id,
        modality="CT",  # Default, will be detected from DICOM
        status=ScanStatus.UPLOADED,
        s3_key=f"scans/{scan_id}/",
        file_count=len(files),
        total_size_mb=0
    )
    db.add(scan)
    await db.commit()
    
    # Upload files to S3/MinIO
    total_size = 0
    for file in files:
        file_key = f"scans/{scan_id}/{file.filename}"
        s3_client.upload_fileobj(
            file.file,
            settings.S3_BUCKET,
            file_key
        )
        total_size += file.size
    
    # Update scan with total size
    scan.total_size_mb = total_size / (1024 * 1024)
    await db.commit()
    
    # Trigger segmentation in background
    background_tasks.add_task(process_segmentation, scan_id, db)
    
    return ScanUploadResponse(
        scan_id=scan_id,
        status="uploaded",
        message=f"Successfully uploaded {len(files)} DICOM files"
    )

@router.get("/{scan_id}/status", response_model=ScanStatusResponse)
async def get_scan_status(
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get segmentation job status for a scan"""
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalar_one_or_none()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Calculate progress based on status
    progress_map = {
        ScanStatus.UPLOADED: 0.0,
        ScanStatus.SEGMENTING: 50.0,
        ScanStatus.SEGMENTED: 100.0,
        ScanStatus.FAILED: 0.0
    }
    
    return ScanStatusResponse(
        scan_id=scan_id,
        status=scan.status.value,
        progress=progress_map.get(scan.status, 0.0),
        message="Segmentation in progress" if scan.status == ScanStatus.SEGMENTING else None
    )

@router.get("/{scan_id}/meshes", response_model=MeshListResponse)
async def list_meshes(
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all segmented meshes for a scan"""
    result = await db.execute(
        select(AnatomyModel).where(AnatomyModel.scan_id == scan_id)
    )
    meshes = result.scalars().all()
    
    return MeshListResponse(
        scan_id=scan_id,
        meshes=[
            {
                "tissue_type": mesh.tissue_type.value,
                "mesh_s3_key": mesh.mesh_s3_key,
                "volume_cm3": mesh.volume_cm3,
                "quality_score": mesh.quality_score
            }
            for mesh in meshes
        ]
    )

@router.get("/{scan_id}/meshes/{tissue_type}")
async def download_mesh(
    scan_id: str,
    tissue_type: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Download a specific mesh as STL file"""
    result = await db.execute(
        select(AnatomyModel).where(
            AnatomyModel.scan_id == scan_id,
            AnatomyModel.tissue_type == tissue_type
        )
    )
    mesh = result.scalar_one_or_none()
    
    if not mesh:
        raise HTTPException(status_code=404, detail="Mesh not found")
    
    # Generate presigned URL for download
    url = s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': settings.S3_BUCKET, 'Key': mesh.mesh_s3_key},
        ExpiresIn=3600
    )
    
    return {"download_url": url}

@router.post("/{scan_id}/model")
async def generate_anatomy_model(
    scan_id: str,
    current_user: dict = Depends(require_role("surgeon")),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate patient-specific anatomy model
    Combines all segmented meshes into a complete 3D model
    """
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalar_one_or_none()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    if scan.status != ScanStatus.SEGMENTED:
        raise HTTPException(
            status_code=400,
            detail="Scan must be segmented before generating model"
        )
    
    # In production, this would:
    # 1. Load all segmented meshes
    # 2. Combine them into a single watertight model
    # 3. Optimize mesh topology
    # 4. Store in S3
    # 5. Return download URL
    
    return {
        "scan_id": scan_id,
        "status": "processing",
        "message": "Anatomy model generation started"
    }

async def process_segmentation(scan_id: str, db: AsyncSession):
    """
    Background task to process DICOM segmentation
    In production, this would use MONAI + TotalSegmentator
    """
    try:
        # Update status to segmenting
        result = await db.execute(select(Scan).where(Scan.id == scan_id))
        scan = result.scalar_one()
        scan.status = ScanStatus.SEGMENTING
        await db.commit()
        
        # TODO: Implement MONAI segmentation
        # 1. Download DICOM files from S3
        # 2. Load DICOM series
        # 3. Run TotalSegmentator model
        # 4. Generate STL meshes for each tissue type
        # 5. Upload meshes to S3
        # 6. Create AnatomyModel records
        
        # For now, simulate segmentation
        await asyncio.sleep(5)  # Simulate processing time
        
        # Update status to segmented
        scan.status = ScanStatus.SEGMENTED
        await db.commit()
        
    except Exception as e:
        # Update status to failed
        scan.status = ScanStatus.FAILED
        scan.error_message = str(e)
        await db.commit()
        raise

import asyncio
