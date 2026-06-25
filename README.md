# ShoulderSim AI

A biomechanical shoulder simulation platform for pre-operative surgical planning and implant testing.

## Tech Stack

### Frontend
- React 18 - UI framework
- TypeScript 5.9 - Type-safe development
- Vite - Build tool and dev server

### 3D Visualization
- Three.js - 3D rendering engine
- @react-three/fiber - React renderer for Three.js
- @react-three/drei - Helpers for React Three Fiber

### UI Components
- Radix UI - Headless UI components
- Tailwind CSS - Utility-first CSS framework
- Framer Motion - Animation library
- Lucide React - Icon library
- Recharts - Data visualization charts

### Routing & State
- Wouter - Lightweight routing
- @tanstack/react-query - Data fetching and caching
- React Hook Form - Form management
- Zod - Schema validation

### Package Management
- pnpm - Fast, disk space efficient package manager

## How It Works

### Architecture

This is a monorepo application with the following structure:

```
shouldersim-ai/
├── artifacts/
│   ├── shouldersim-ai/          # Main React application
│   ├── api-server/              # Backend API server
│   └── mockup-sandbox/          # Design mockups
├── lib/                         # Shared libraries
│   ├── api-client-react/        # API client for React
│   ├── api-spec/                # API specifications
│   ├── api-zod/                 # Zod schemas
│   └── db/                      # Database utilities
├── scripts/                     # Build and utility scripts
└── package.json                 # Root package.json
```

### Features

**3D Shoulder Visualization**
- Procedural 3D scapula and humerus models
- Layer-based anatomy (bones, muscles, tendons, cartilage, nerves, implants)
- Real-time kinematic simulation
- Stereoscopic VR support

**Surgical Planning**
- Implant positioning parameters (inclination, anteversion, depth, offset)
- Range of motion simulation (flexion, extension, abduction, rotation)
- Stability and wear analysis
- Pre-operative report generation

**CT/MRI Processing**
- Multi-planar reconstruction (MPR) viewer
- Axial, coronal, and sagittal slice visualization
- DICOM upload and processing workflow

**Dashboard & Analytics**
- Patient case management
- Surgical team collaboration
- Outcome tracking and analytics
- AI-powered predictions

### Data Flow

1. Patient Data Input → DICOM/CT scan upload
2. AI Processing → 3D reconstruction and segmentation
3. Surgical Planning → Parameter adjustment and simulation
4. Analysis → Biomechanical calculations and predictions
5. Output → Surgical reports and implant recommendations

## Dataset Information

### Current Implementation

**Important:** This application currently uses simulated/mock data for demonstration purposes. No real patient data or medical imaging datasets are included in this codebase.

**Simulated Data:**
- Sample patient profiles with common diagnoses (OA, rotator cuff tears, AVN)
- Implant type configurations (TSA, RSA, resurfacing)
- Recovery progression simulation data
- Biomechanical parameter ranges based on clinical literature

### Production Dataset Requirements

To deploy this system in a clinical setting, you would need:

**Medical Imaging Data:**
- DICOM datasets from hospital PACS systems (requires HIPAA compliance)
- CT/MRI scans of shoulder anatomy
- Proper IRB approval and data use agreements

**Clinical Data:**
- Historical surgical outcome databases
- Implant manufacturer specifications
- Clinical trial data for AI model training

### Publicly Available Research Datasets

For development and testing purposes, researchers can access:

**The Cancer Imaging Archive (TCIA)**
- URL: https://www.cancerimagingarchive.net/
- Contains anonymized medical images
- Requires data use agreement
- Includes various imaging modalities

**Medical Segmentation Decathlon**
- URL: https://decathlon-10.grand-challenge.org/
- Medical image segmentation datasets
- Open access for research
- Multiple anatomical regions

**Osteoarthritis Initiative (OAI)**
- URL: https://nda.nih.gov/oai/
- Longitudinal osteoarthritis data
- Includes imaging and clinical data
- Requires data access request

**Note:** These datasets require proper authorization and are not included in this repository.

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm typecheck
```

### Development

```bash
# Navigate to main app
cd artifacts/shouldersim-ai

# Run dev server
pnpm dev

# Build
pnpm build
```

## 📁 Project Structure

### Main Application (`artifacts/shouldersim-ai/`)

```
src/
├── App.tsx                    # Main app component with routing
├── main.tsx                   # Application entry point
├── index.css                  # Global styles
├── components/
│   └── ui/                    # Reusable UI components (Radix UI)
├── pages/                     # Page components
│   ├── Home.tsx               # Landing page
│   ├── SimulationPage.tsx    # Main simulation interface
│   ├── DashboardPage.tsx     # Surgeon dashboard
│   ├── ImplantLibraryPage.tsx # Implant catalog
│   └── SurgeonTrainingPage.tsx # Training module
├── hooks/                     # Custom React hooks
└── lib/                       # Utility functions
```

### Key Components

**SimulationPage.tsx** - Core simulation engine
- 3D shoulder model rendering
- Parameter controls
- Real-time biomechanical calculations
- CT slice visualization
- Surgical report generation

**DashboardPage.tsx** - Surgeon workspace
- Case management
- DICOM upload workflow
- Team collaboration
- Analytics dashboard

**Home.tsx** - Marketing landing page
- Feature showcase
- Platform overview
- Interactive demos

## 🔧 Configuration

### Environment Variables

Create `.env` file in `artifacts/shouldersim-ai/`:

```env
VITE_API_URL=http://localhost:3001
VITE_ENABLE_ANALYTICS=true
```

### Build Configuration

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration

## 📝 API Integration

The application is designed to integrate with a backend API:

**Endpoints (planned):**
- `POST /api/upload` - DICOM file upload
- `POST /api/segment` - AI segmentation
- `POST /api/simulate` - Biomechanical simulation
- `GET /api/implants` - Implant library
- `POST /api/report` - Report generation

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test

# Run with coverage
pnpm test:coverage
```

## 📄 License

MIT License - See LICENSE file for details

## 👥 Team

- Development Team
- Medical Advisors
- Research Partners

## 🙏 Acknowledgments

- Three.js community
- Radix UI contributors
- Medical research partners
