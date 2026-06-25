"""
Database Models for ShoulderSim AI
SQLAlchemy ORM models for PostgreSQL + TimescaleDB
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, ForeignKey, Enum, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    """User roles for RBAC"""
    SURGEON = "surgeon"
    RESIDENT = "resident"
    MANUFACTURER_REP = "manufacturer_rep"
    ADMIN = "admin"
    READ_ONLY = "read_only"

class ScanStatus(enum.Enum):
    """DICOM scan processing status"""
    UPLOADED = "uploaded"
    SEGMENTING = "segmenting"
    SEGMENTED = "segmented"
    FAILED = "failed"

class SimulationStatus(enum.Enum):
    """Simulation job status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class SimulationType(enum.Enum):
    """Simulation types"""
    ROM = "rom"
    FEA = "fea"
    MUSCLE_FORCES = "muscle_forces"

class TissueType(enum.Enum):
    """Anatomical tissue types"""
    HUMERUS = "humerus"
    SCAPULA = "scapula"
    CLAVICLE = "clavicle"
    CARTILAGE = "cartilage"
    SUPRASPINATUS = "supraspinatus"
    INFRASPINATUS = "infraspinatus"
    SUBSCAPULARIS = "subscapularis"
    TERES_MINOR = "teres_minor"
    DELTOID = "deltoid"

class ImplantType(enum.Enum):
    """Implant types"""
    TSA = "tsa"  # Total Shoulder Arthroplasty
    RSA = "rsa"  # Reverse Shoulder Arthroplasty
    RESURFACING = "resurfacing"
    HEMI = "hemi"  # Hemiarthroplasty

class User(Base):
    """User accounts with RBAC"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.READ_ONLY)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    surgical_plans = relationship("SurgicalPlan", back_populates="surgeon")
    audit_logs = relationship("AuditLog", back_populates="user")

class Patient(Base):
    """De-identified patient records"""
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True)
    deid_hash = Column(String, unique=True, nullable=False, index=True)  # De-identification hash
    age_band = Column(String)  # e.g., "60-69"
    sex = Column(String)
    bmi = Column(Float)
    comorbidities = Column(JSON)  # List of comorbidities
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    scans = relationship("Scan", back_populates="patient")

class Scan(Base):
    """DICOM scan records"""
    __tablename__ = "scans"
    
    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    modality = Column(String)  # CT, MRI
    upload_ts = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(ScanStatus), default=ScanStatus.UPLOADED)
    s3_key = Column(String)  # S3/MinIO path to DICOM files
    file_count = Column(Integer)
    total_size_mb = Column(Float)
    
    # Relationships
    patient = relationship("Patient", back_populates="scans")
    anatomy_models = relationship("AnatomyModel", back_populates="scan")
    simulations = relationship("Simulation", back_populates="scan")
    surgical_plans = relationship("SurgicalPlan", back_populates="scan")

class AnatomyModel(Base):
    """Segmented 3D anatomy models"""
    __tablename__ = "anatomy_models"
    
    id = Column(String, primary_key=True)
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False)
    tissue_type = Column(Enum(TissueType), nullable=False)
    mesh_s3_key = Column(String)  # Path to STL/OBJ file
    volume_cm3 = Column(Float)
    surface_area_cm2 = Column(Float)
    quality_score = Column(Float)  # Segmentation quality (0-1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    scan = relationship("Scan", back_populates="anatomy_models")

class Implant(Base):
    """Implant catalog from manufacturers"""
    __tablename__ = "implants"
    
    id = Column(String, primary_key=True)
    manufacturer = Column(String, nullable=False, index=True)
    model = Column(String, nullable=False)
    type = Column(Enum(ImplantType), nullable=False)
    size = Column(String)  # e.g., "42mm"
    geometry_s3_key = Column(String)  # Path to STL/STEP file
    material = Column(String)  # UHMWPE, ceramic, metal
    metadata = Column(JSON)  # Additional specifications
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sandbox_tests = relationship("SandboxTest", back_populates="implant")
    surgical_plans = relationship("SurgicalPlan", back_populates="implant")

class Simulation(Base):
    """Biomechanical simulation jobs"""
    __tablename__ = "simulations"
    
    id = Column(String, primary_key=True)
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False)
    type = Column(Enum(SimulationType), nullable=False)
    params_json = Column(JSON)  # Simulation parameters
    status = Column(Enum(SimulationStatus), default=SimulationStatus.PENDING)
    result_s3_key = Column(String)  # Path to results
    error_message = Column(Text)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    duration_seconds = Column(Float)
    
    # Relationships
    scan = relationship("Scan", back_populates="simulations")
    sandbox_tests = relationship("SandboxTest", back_populates="simulation")

class SandboxTest(Base):
    """Implant testing sandbox results"""
    __tablename__ = "sandbox_tests"
    
    id = Column(String, primary_key=True)
    simulation_id = Column(String, ForeignKey("simulations.id"), nullable=False)
    implant_id = Column(String, ForeignKey("implants.id"), nullable=False)
    test_type = Column(String)  # compare, wear, impingement, stability
    result_json = Column(JSON)  # Test results
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    simulation = relationship("Simulation", back_populates="sandbox_tests")
    implant = relationship("Implant", back_populates="sandbox_tests")

class AIPrediction(Base):
    """AI model predictions with audit trail"""
    __tablename__ = "ai_predictions"
    
    id = Column(String, primary_key=True)
    model_name = Column(String, nullable=False, index=True)
    model_version = Column(String, nullable=False)
    input_hash = Column(String)  # Hash of input for reproducibility
    input_snapshot = Column(JSON)  # Full input for audit
    output_json = Column(JSON)  # Model output
    confidence_score = Column(Float)
    shap_values = Column(JSON)  # Explainability values
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class SurgicalPlan(Base):
    """Surgical planning records"""
    __tablename__ = "surgical_plans"
    
    id = Column(String, primary_key=True)
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False)
    surgeon_id = Column(String, ForeignKey("users.id"), nullable=False)
    implant_id = Column(String, ForeignKey("implants.id"), nullable=False)
    position_json = Column(JSON)  # Implant position parameters
    approach_annotation = Column(JSON)  # Surgical approach route
    locked_at = Column(DateTime)  # When plan was finalized
    pdf_s3_key = Column(String)  # Path to PDF export
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    scan = relationship("Scan", back_populates="surgical_plans")
    surgeon = relationship("User", back_populates="surgical_plans")
    implant = relationship("Implant", back_populates="surgical_plans")
    outcomes = relationship("SurgicalOutcome", back_populates="plan")

class SurgicalOutcome(Base):
    """Post-operative outcomes tracking"""
    __tablename__ = "surgical_outcomes"
    
    id = Column(String, primary_key=True)
    plan_id = Column(String, ForeignKey("surgical_plans.id"), nullable=False)
    ases_3m = Column(Float)  # ASES score at 3 months
    ases_6m = Column(Float)  # ASES score at 6 months
    ases_12m = Column(Float)  # ASES score at 12 months
    dash_3m = Column(Float)  # DASH score at 3 months
    dash_6m = Column(Float)  # DASH score at 6 months
    dash_12m = Column(Float)  # DASH score at 12 months
    revision_flag = Column(Boolean, default=False)
    revision_reason = Column(Text)
    complications = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    plan = relationship("SurgicalPlan", back_populates="outcomes")

class AuditLog(Base):
    """Immutable audit log for compliance"""
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    action = Column(String, nullable=False)  # CREATE, READ, UPDATE, DELETE
    resource_type = Column(String, nullable=False)  # scan, simulation, plan, etc.
    resource_id = Column(String, nullable=False)
    ip_address = Column(String)
    user_agent = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    details = Column(JSON)  # Additional context
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")

# Regulatory Compliance Tables

class RiskItem(Base):
    """ISO 14971 Risk Management - Risk Register"""
    __tablename__ = "risk_items"
    
    id = Column(String, primary_key=True)
    hazard = Column(String, nullable=False)  # Potential source of harm
    hazardous_situation = Column(String, nullable=False)  # Circumstances leading to harm
    harm = Column(String, nullable=False)  # Injury or damage to health
    probability = Column(Integer, nullable=False)  # 1-5 scale
    severity = Column(Integer, nullable=False)  # 1-5 scale
    risk_level = Column(String, nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    mitigation_desc = Column(Text, nullable=False)  # Mitigation measures
    test_case_id = Column(String, ForeignKey("test_cases.id"))  # Linked test case
    residual_risk = Column(Integer)  # Risk after mitigation (1-5 scale)
    status = Column(String, default="active")  # active, mitigated, accepted
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AdverseEvent(Base):
    """Post-Market Surveillance - Adverse Event Reporting"""
    __tablename__ = "adverse_events"
    
    id = Column(String, primary_key=True)
    report_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    event_type = Column(String, nullable=False)  # Type of adverse event
    severity = Column(String, nullable=False)  # mild, moderate, severe, life-threatening
    description = Column(Text, nullable=False)
    linked_plan_id = Column(String, ForeignKey("surgical_plans.id"))
    reporter_id = Column(String, ForeignKey("users.id"))
    status = Column(String, default="open")  # open, investigating, resolved, closed
    resolution = Column(Text)
    fda_reported = Column(Boolean, default=False)
    eudamed_reported = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UsabilitySession(Base):
    """IEC 62366 Usability Engineering - Study Sessions"""
    __tablename__ = "usability_sessions"
    
    id = Column(String, primary_key=True)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    participant_role = Column(String, nullable=False)  # surgeon, resident, manufacturer_rep
    task_id = Column(String, nullable=False)  # Specific UI task being tested
    outcome = Column(String, nullable=False)  # success, partial_success, failure
    errors_observed = Column(JSON)  # List of errors with timestamps
    time_to_complete_seconds = Column(Integer)
    notes = Column(Text)
    session_type = Column(String)  # formative, summative
    created_at = Column(DateTime, default=datetime.utcnow)

class TestCase(Base):
    """IEC 62304 Test Cases with Traceability"""
    __tablename__ = "test_cases"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    test_type = Column(String, nullable=False)  # unit, integration, system, regression
    requirement_id = Column(String)  # Linked to SRS requirement
    module = Column(String, nullable=False)  # Which module this tests
    safety_critical = Column(Boolean, default=False)
    coverage_requirement = Column(String)  # 100% for safety-critical
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    risk_items = relationship("RiskItem", backref="test_case")
