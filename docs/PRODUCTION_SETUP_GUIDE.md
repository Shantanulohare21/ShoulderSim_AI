# ShoulderSim AI - Production Setup Guide

## Overview

This document provides comprehensive setup instructions for the production-grade ShoulderSim AI infrastructure that has been built. The system follows the specification provided and includes:

- **Monorepo Structure**: Frontend (React), Backend (FastAPI), ML (PyTorch), Infrastructure (Terraform)
- **Docker Compose**: Complete local development environment
- **Database**: PostgreSQL + TimescaleDB for time-series data
- **Async Processing**: Celery + Redis for simulation jobs
- **Storage**: MinIO (S3-compatible) for DICOM files
- **Monitoring**: Prometheus + Grafana
- **Model Registry**: MLflow

---

## Project Structure

```
ShoulderSim_AI/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/v1/         # API routes
│   │   │   ├── scans.py    # DICOM ingestion
│   │   │   └── simulations.py # ROM, FEA, muscle forces
│   │   ├── core/           # Configuration, security, database
│   │   ├── models/         # SQLAlchemy ORM models
│   │   └── tasks/          # Celery async tasks
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── ml/                     # AI/ML module
│   └── requirements.txt    # PyTorch, MONAI, scikit-learn
├── infra/                  # Infrastructure as Code
│   ├── postgres/           # Database initialization
│   ├── prometheus/         # Monitoring config
│   └── grafana/            # Dashboard configs
├── src/                    # React frontend
├── docker-compose.yml      # Local development
├── .env.example           # Environment variables template
└── docs/                  # Documentation
```

---

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)
- Node.js 18+ (for frontend development)
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd ShoulderSim_AI
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file with your settings:

```bash
# Security
SECRET_KEY=your-secret-key-change-in-production

# Database (Docker Compose handles these)
DATABASE_URL=postgresql://shouldersim:shouldersim_password@postgres:5432/shouldersim
REDIS_URL=redis://redis:6379/0

# Storage
S3_ENDPOINT_URL=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=shouldersim-dicom
```

### 3. Start All Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- TimescaleDB (port 5433)
- Redis (port 6379)
- MinIO (ports 9000, 9001)
- FastAPI Backend (port 8000)
- Celery Worker
- Celery Beat
- MLflow (port 5000)
- Prometheus (port 9090)
- Grafana (port 3001)
- Frontend (port 5173)

### 4. Verify Services

```bash
# Check backend health
curl http://localhost:8000/health

# Check API status
curl http://localhost:8000/api/v1/status

# View API documentation
open http://localhost:8000/api/docs
```

---

## API Documentation

### DICOM Scan API

#### Upload DICOM Series

```bash
curl -X POST "http://localhost:8000/api/v1/scans/upload" \
  -H "Authorization: Bearer <token>" \
  -F "patient_id=<patient_id>" \
  -F "files=@dicom_file1.dcm" \
  -F "files=@dicom_file2.dcm"
```

#### Get Scan Status

```bash
curl -X GET "http://localhost:8000/api/v1/scans/<scan_id>/status" \
  -H "Authorization: Bearer <token>"
```

#### List Segmented Meshes

```bash
curl -X GET "http://localhost:8000/api/v1/scans/<scan_id>/meshes" \
  -H "Authorization: Bearer <token>"
```

### Simulation API

#### Trigger ROM Simulation

```bash
curl -X POST "http://localhost:8000/api/v1/simulations/rom" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "scan_id": "<scan_id>",
    "abduction_range": [0, 180],
    "flexion_range": [0, 180],
    "rotation_range": [-90, 90],
    "resolution_degrees": 1
  }'
```

#### Trigger FEA Simulation

```bash
curl -X POST "http://localhost:8000/api/v1/simulations/fea" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "scan_id": "<scan_id>",
    "loading_scenario": "arm_elevation",
    "load_kg": 5.0
  }'
```

#### Get Simulation Status

```bash
curl -X GET "http://localhost:8000/api/v1/simulations/<job_id>/status" \
  -H "Authorization: Bearer <token>"
```

---

## Database Schema

### Key Tables

**users**: User accounts with RBAC
- id, email, hashed_password, role, is_active

**patients**: De-identified patient records
- id, deid_hash, age_band, sex, bmi, comorbidities

**scans**: DICOM scan records
- id, patient_id, modality, status, s3_key

**anatomy_models**: Segmented 3D anatomy
- id, scan_id, tissue_type, mesh_s3_key, volume_cm3

**simulations**: Biomechanical simulation jobs
- id, scan_id, type, params_json, status, result_s3_key

**implants**: Implant catalog
- id, manufacturer, model, type, size, geometry_s3_key

**ai_predictions**: AI model predictions
- id, model_name, model_version, input_hash, output_json

**surgical_plans**: Surgical planning records
- id, scan_id, surgeon_id, implant_id, position_json

**surgical_outcomes**: Post-operative outcomes
- id, plan_id, ases_3m, ases_6m, ases_12m, revision_flag

**audit_logs**: Immutable audit log
- id, user_id, action, resource_type, resource_id, timestamp

---

## Authentication & Authorization

### Role-Based Access Control (RBAC)

**Roles:**
- **admin**: Full system access
- **surgeon**: Can upload scans, run simulations, create plans
- **resident**: Limited access, training mode
- **manufacturer_rep**: Read-only access to implant data
- **read_only**: View-only access

### Token Management

**Access Token:** 15 minute TTL
**Refresh Token:** 7 day TTL

### Example Authentication Flow

```python
# Login (to be implemented)
POST /api/v1/auth/login
{
  "email": "surgeon@example.com",
  "password": "password"
}

# Response
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "token_type": "bearer"
}

# Use token in requests
Authorization: Bearer jwt_token
```

---

## Monitoring

### Prometheus

Access: http://localhost:9090

Metrics available:
- HTTP request latency
- Database query performance
- Celery task queue depth
- GPU utilization (when deployed)

### Grafana

Access: http://localhost:3001
Default credentials: admin / admin

Dashboards (to be configured):
- API performance
- Simulation job throughput
- Database health
- System resources

### MLflow

Access: http://localhost:5000

Features:
- Model registry
- Experiment tracking
- Model versioning
- Performance metrics

---

## Development Workflow

### Backend Development

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run locally (without Docker)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest tests/

# Run with Docker
docker-compose up backend
```

### Frontend Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### ML Development

```bash
cd ml
pip install -r requirements.txt

# Train model
python models/train.py

# Serve model
python models/serve.py
```

---

## Deployment

### Production Deployment Steps

1. **Environment Setup**
   - Configure production environment variables
   - Set up AWS GovCloud or Azure Health
   - Configure GPU instances

2. **Database Migration**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

3. **Build and Push Images**
   ```bash
   docker build -t shouldersim-backend ./backend
   docker build -t shouldersim-frontend .
   docker push <registry>/shouldersim-backend
   docker push <registry>/shouldersim-frontend
   ```

4. **Kubernetes Deployment**
   ```bash
   cd infra/k8s
   kubectl apply -f namespace.yaml
   kubectl apply -f configmaps.yaml
   kubectl apply -f deployments.yaml
   kubectl apply -f services.yaml
   ```

5. **Monitoring Setup**
   - Configure Prometheus targets
   - Set up Grafana dashboards
   - Configure Sentry error tracking

---

## Security Checklist

### Before Production Deployment

- [ ] Change SECRET_KEY to strong random value
- [ ] Enable HTTPS/TLS for all endpoints
- [ ] Configure firewall rules
- [ ] Set up database encryption at rest
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up intrusion detection
- [ ] Conduct security audit
- [ ] Complete HIPAA compliance assessment
- [ ] Sign BAAs with cloud vendors

---

## Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check logs
docker-compose logs backend

# Verify database connection
docker-compose exec postgres psql -U shouldersim -d shouldersim
```

**Celery tasks not processing**
```bash
# Check Celery worker logs
docker-compose logs celery-worker

# Verify Redis connection
docker-compose exec redis redis-cli ping
```

**MinIO connection issues**
```bash
# Check MinIO logs
docker-compose logs minio

# Verify bucket exists
docker-compose exec minio mc ls shouldersim-dicom
```

---

## Next Steps

### Immediate (Week 1-2)

1. **Complete Authentication System**
   - Implement OAuth2 login endpoint
   - Add user registration
   - Implement token refresh logic

2. **DICOM Segmentation Integration**
   - Integrate MONAI TotalSegmentator
   - Implement mesh generation
   - Add quality control checks

3. **Simulation Implementation**
   - Implement actual ROM simulation with FEniCSx
   - Add FEA stress analysis
   - Implement muscle force calculations

### Short-term (Month 1-3)

4. **AI Model Development**
   - Train Model A (success predictor)
   - Set up MLflow model registry
   - Implement model serving endpoints

5. **Sandbox Development**
   - Implement collision detection (GJK)
   - Add wear simulation
   - Create stability testing

6. **Surgical Planning Interface**
   - Build pre-op planner wizard
   - Add PDF export functionality
   - Implement AR/VR viewer

### Long-term (Month 4-12)

7. **HIPAA Compliance**
   - Implement column-level encryption
   - Add DICOM de-identification
   - Complete security audit

8. **FDA Preparation**
   - Document all algorithms
   - Conduct clinical validation studies
   - Prepare 510(k) submission

9. **Production Deployment**
   - Set up Kubernetes cluster
   - Configure GPU nodes
   - Implement CI/CD pipeline

---

## Support

For issues or questions:
- Check API documentation: http://localhost:8000/api/docs
- Review logs: `docker-compose logs <service>`
- Check monitoring: http://localhost:9090 (Prometheus)

---

## License

Proprietary - All rights reserved

---

**Last Updated:** June 26, 2026
**Version:** 1.0.0
