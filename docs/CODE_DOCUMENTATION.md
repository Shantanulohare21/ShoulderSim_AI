# Code Documentation - ShoulderSim AI

## Overview

This document provides a comprehensive explanation of the ShoulderSim AI codebase, including file structure, component architecture, data flow, and implementation details.

---

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Application Architecture](#application-architecture)
3. [Component Breakdown](#component-breakdown)
4. [Data Flow](#data-flow)
5. [Key Algorithms](#key-algorithms)
6. [State Management](#state-management)
7. [3D Rendering Pipeline](#3d-rendering-pipeline)
8. [File-by-File Explanation](#file-by-file-explanation)

---

## 📁 Project Structure

### Root Directory

```
ShoulderSim_AI/
├── artifacts/                    # Built applications
│   ├── shouldersim-ai/           # Main React application
│   ├── api-server/              # Backend API (placeholder)
│   └── mockup-sandbox/           # Design mockups
├── lib/                         # Shared libraries
│   ├── api-client-react/        # React API client
│   ├── api-spec/                # API specifications
│   ├── api-zod/                 # Zod validation schemas
│   └── db/                      # Database utilities
├── scripts/                     # Build scripts
├── docs/                        # Documentation (this folder)
├── package.json                 # Root package.json
├── pnpm-workspace.yaml          # PNPM workspace config
├── tsconfig.json                # TypeScript config
└── README.md                    # Project README
```

### Main Application Structure

```
artifacts/shouldersim-ai/
├── public/                      # Static assets
├── src/
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Global styles
│   ├── components/
│   │   └── ui/                  # Reusable UI components (55 files)
│   ├── pages/                   # Page components
│   │   ├── Home.tsx             # Landing page
│   │   ├── SimulationPage.tsx   # Main simulation
│   │   ├── DashboardPage.tsx    # Surgeon dashboard
│   │   ├── ImplantLibraryPage.tsx # Implant catalog
│   │   ├── SurgeonTrainingPage.tsx # Training module
│   │   └── not-found.tsx        # 404 page
│   ├── hooks/                   # Custom React hooks
│   │   └── use-toast.ts        # Toast notification hook
│   └── lib/                     # Utilities
│       └── utils.ts             # Helper functions
├── package.json                 # App dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts               # Vite build config
└── components.json              # shadcn/ui config
```

---

## 🏗️ Application Architecture

### Technology Stack

**Frontend Framework:**
- React 18 with TypeScript
- Functional components with hooks
- No class components (modern React pattern)

**Routing:**
- Wouter (lightweight router)
- Hash-based or history-based routing
- Route guards (not implemented yet)

**State Management:**
- React useState for local state
- React Query for server state (placeholder)
- Context API for global state (not used yet)

**Styling:**
- Tailwind CSS for utility classes
- CSS-in-JS via Tailwind
- Component-scoped styles via CSS modules

**3D Rendering:**
- Three.js via @react-three/fiber
- Declarative 3D components
- Real-time animation loop

**UI Components:**
- Radix UI primitives (headless components)
- shadcn/ui component library
- Custom styled components

---

## 🧩 Component Breakdown

### App.tsx - Root Component

**Purpose:** Application entry point and routing configuration

**Key Responsibilities:**
- Configure React Query client
- Set up routing with Wouter
- Provide global context providers
- Initialize dark mode

**Code Structure:**
```typescript
// 1. Imports
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 2. Query client initialization
const queryClient = new QueryClient();

// 3. Route configuration
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/simulation" component={SimulationPage} />
      <Route path="/implants" component={ImplantLibraryPage} />
      <Route path="/training" component={SurgeonTrainingPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// 4. Main app component
function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

**Data Flow:**
1. User navigates to URL
2. Wouter matches route
3. Corresponding page component renders
4. Page component manages its own state
5. Child components receive props

---

### SimulationPage.tsx - Core Simulation

**Purpose:** Main surgical planning and simulation interface

**Component Hierarchy:**
```
SimulationPage (main container)
├── ShoulderSimViewer (3D/CT viewer)
│   ├── ScapulaMesh (3D scapula model)
│   ├── HumerusMesh (3D humerus model)
│   ├── SoftTissueLayers (muscles, tendons, nerves)
│   ├── ImpingementIndicator (collision detection)
│   ├── ForceVectors (force visualization)
│   ├── CtSliceViewer (2D CT slices)
│   └── StereoscopicCanvas (VR mode)
├── Planning Controls (parameter sliders)
├── Motion Controls (ROM sliders)
├── Layer Toggles (visibility controls)
├── Analysis Tabs (stability, wear, etc.)
└── SurgicalReportModal (report generation)
```

**State Management:**
```typescript
// Planning parameters
const [planning, setPlanning] = useState<PlanningValues>({
  angle: 135,
  anteversion: 20,
  depth: 28,
  offset: 0,
});

// Motion parameters
const [motionVals, setMotionVals] = useState<MotionValues>({
  flexion: 90,
  extension: 30,
  abduction: 90,
  rotation: 0,
});

// Visualization state
const [layers, setLayers] = useState<Set<LayerKey>>(new Set(["bones", "implant"]));
const [heatmap, setHeatmap] = useState(false);
const [simulationRunning, setSimulationRunning] = useState(false);

// View state
const [selectedPatient, setSelectedPatient] = useState(0);
const [viewMode, setViewMode] = useState<"3d" | "ct">("3d");
const [vrMode, setVrMode] = useState(false);
```

**Key Functions:**

1. **Parameter Updates:**
```typescript
const handlePlanningChange = (key: keyof PlanningValues, value: number) => {
  setPlanning(prev => ({ ...prev, [key]: value }));
};
```

2. **Layer Toggle:**
```typescript
const toggleLayer = (layer: LayerKey) => {
  setLayers(prev => {
    const newLayers = new Set(prev);
    if (newLayers.has(layer)) {
      newLayers.delete(layer);
    } else {
      newLayers.add(layer);
    }
    return newLayers;
  });
};
```

3. **Simulation Control:**
```typescript
const toggleSimulation = () => {
  setSimulationRunning(prev => !prev);
};
```

---

### 3D Components

#### ScapulaMesh Component

**Purpose:** Renders 3D scapula (shoulder blade) model

**Implementation:**
```typescript
function ScapulaMesh({ layers, planning, stressLevel, heatmap }: Props) {
  // 1. Calculate rotation from planning parameters
  const inclinationRad = ((planning.angle - 135) * Math.PI) / 180;
  const anteversionRad = ((planning.anteversion - 20) * Math.PI) / 180;

  // 2. Determine stress color
  const stressColor = stressLevel < 0.3 ? "#22c55e" : 
                      stressLevel < 0.6 ? "#eab308" : "#ef4444";

  // 3. Render procedural geometry
  return (
    <group position={[-1.2, 0, 0]}>
      {/* Scapula Body */}
      <mesh>
        <boxGeometry args={[1.5, 2, 0.15]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* Glenoid Neck */}
      <mesh position={[0.8, 0.2, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.3, 0.5, 0.8, 16]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Glenoid Socket with implant */}
      <group position={[1.1, 0.3, 0]} rotation={[0, anteversionRad, inclinationRad]}>
        {/* Bone base */}
        <mesh>
          <cylinderGeometry args={[0.45, 0.45, 0.2, 32]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>

        {/* Cartilage layer */}
        {layers.has("cartilage") && (
          <mesh position={[0, 0.11, 0]}>
            <cylinderGeometry args={[0.47, 0.47, 0.05, 32]} />
            <meshStandardMaterial color="#86efac" transparent opacity={0.6} />
          </mesh>
        )}

        {/* Implant */}
        {layers.has("implant") && (
          <group position={[0, 0.15, 0]}>
            <mesh>
              <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#06b6d4" roughness={0.2} metalness={0.8} />
            </mesh>

            {/* Stress heatmap */}
            {heatmap && (
              <mesh position={[0, 0.02, 0]}>
                <sphereGeometry args={[0.41, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshBasicMaterial color={stressColor} transparent opacity={0.4} wireframe />
              </mesh>
            )}
          </group>
        )}
      </group>
    </group>
  );
}
```

**Key Features:**
- Procedural geometry (no external 3D models)
- Dynamic rotation based on planning parameters
- Conditional layer rendering
- Stress heatmap visualization

---

#### HumerusMesh Component

**Purpose:** Renders 3D humerus (upper arm bone) with implant

**Implementation:**
```typescript
function HumerusMesh({ layers, motionVals, planning, simulationRunning }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  // Real-time animation loop
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Get motion values
    let flex = motionVals.flexion;
    let abd = motionVals.abduction;
    let rot = motionVals.rotation;
    let ext = motionVals.extension;

    // Add animation if simulation running
    if (simulationRunning) {
      const time = state.clock.getElapsedTime();
      flex += Math.sin(time * 2.5) * 12;
      abd += Math.cos(time * 2.0) * 10;
    }

    // Convert to radians and apply rotation
    const rotX = (flex * Math.PI) / 180;
    const rotY = (rot * Math.PI) / 180;
    const rotZ = ((abd - ext) * Math.PI) / 180;

    groupRef.current.rotation.set(-rotX, rotY, -rotZ);
  });

  // Calculate offset
  const humeralOffset = planning.offset / 10;

  return (
    <group ref={groupRef} position={[0.3, -0.3, 0]}>
      {/* Humeral Shaft */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.35, 0.28, 2.0, 16]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* Humeral Head with offset */}
      <group position={[humeralOffset, 0, 0]}>
        <mesh position={[0, -0.1, 0]}>
          <sphereGeometry args={[0.48, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>

        {/* Implant */}
        {layers.has("implant") && (
          <group position={[0, -0.15, 0]}>
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.15, 0.08, 0.9, 16]} />
              <meshStandardMaterial color="#06b6d4" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.49, 0.44, 0.15, 32]} />
              <meshStandardMaterial color="#0891b2" />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
```

**Key Features:**
- Real-time animation via useFrame hook
- Dynamic rotation based on motion parameters
- Simulation mode with automatic motion
- Offset calculation from planning parameters

---

#### SoftTissueLayers Component

**Purpose:** Renders muscles, tendons, and nerves

**Implementation:**
```typescript
function SoftTissueLayers({ layers, motionVals }: Props) {
  if (!layers.has("muscles") && !layers.has("tendons") && !layers.has("nerves")) return null;

  // Calculate dynamic attachment points
  const abdRad = (motionVals.abduction * Math.PI) / 180;
  const flexRad = (motionVals.flexion * Math.PI) / 180;

  const humAttachY = -0.3 - Math.sin(abdRad) * 0.5;
  const humAttachX = 0.3 + Math.cos(abdRad) * 0.4;
  const humAttachZ = Math.sin(flexRad) * 0.3;

  return (
    <group>
      {/* Supraspinatus Muscle */}
      {layers.has("muscles") && (
        <ThreeLine
          points={[[-1.2, 0.8, 0], [-0.5, 0.6, 0.1], [humAttachX, humAttachY + 0.3, humAttachZ]]}
          color="#3b82f6"
          lineWidth={4}
        />
      )}

      {/* Infraspinatus Tendon */}
      {layers.has("tendons") && (
        <ThreeLine
          points={[[-1.0, -0.6, 0.4], [humAttachX, humAttachY, humAttachZ + 0.2]]}
          color="#fbbf24"
          lineWidth={2.5}
        />
      )}

      {/* Brachial Plexus Nerves */}
      {layers.has("nerves") && (
        <group>
          <ThreeLine
            points={[[-1.5, 1.2, -0.2], [-0.8, 0.1, -0.4], [0.1, -1.0, -0.3]]}
            color="#faccc9"
            lineWidth={1.5}
          />
          <ThreeLine
            points={[[-1.5, 1.2, -0.2], [-0.6, -0.2, 0.2], [0.3, -1.2, 0.1]]}
            color="#eab308"
            lineWidth={1.2}
          />
        </group>
      )}
    </group>
  );
}
```

**Key Features:**
- Dynamic attachment points based on motion
- Conditional rendering per layer
- Line-based representation (simplified anatomy)
- Color-coded tissue types

---

#### CtSliceViewer Component

**Purpose:** Renders 2D CT slice views (axial, coronal, sagittal)

**Implementation:**
```typescript
function CtSliceViewer({ sliceIndex, planning, layers }: Props) {
  const axialRef = useRef<HTMLCanvasElement>(null);
  const coronalRef = useRef<HTMLCanvasElement>(null);
  const sagittalRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const drawSlice = (canvas: HTMLCanvasElement | null, type: "axial" | "coronal" | "sagittal") => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      // Draw background
      ctx.fillStyle = "#0c111d";
      ctx.fillRect(0, 0, w, h);

      // Draw grid
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      // ... grid drawing code

      // Calculate geometry based on parameters
      const depthScale = Math.max(0.2, 1.0 - Math.abs(sliceIndex - 64) / 100);
      const angleRad = ((planning.angle - 135) * Math.PI) / 180;
      const anteRad = ((planning.anteversion - 20) * Math.PI) / 180;

      // Draw based on view type
      if (type === "axial") {
        // Draw axial view
        // ... drawing code
      } else if (type === "coronal") {
        // Draw coronal view
        // ... drawing code
      } else if (type === "sagittal") {
        // Draw sagittal view
        // ... drawing code
      }
    };

    drawSlice(axialRef.current, "axial");
    drawSlice(coronalRef.current, "coronal");
    drawSlice(sagittalRef.current, "sagittal");
  }, [sliceIndex, planning, layers]);

  return (
    <div className="grid grid-cols-3 gap-2">
      {["axial", "coronal", "sagittal"].map((type, i) => (
        <div key={type}>
          <canvas
            ref={i === 0 ? axialRef : i === 1 ? coronalRef : sagittalRef}
            width={160}
            height={280}
          />
        </div>
      ))}
    </div>
  );
}
```

**Key Features:**
- Canvas-based 2D rendering
- Three orthogonal views (axial, coronal, sagittal)
- Dynamic geometry based on planning parameters
- Slice depth simulation
- Implant overlay when layer enabled

---

### Analysis Components

#### StabilityTab Component

**Purpose:** Calculate and display implant stability score

**Algorithm:**
```typescript
function StabilityTab({ planning }: Props) {
  // Calculate deviation from optimal
  const deviation = Math.abs(planning.angle - 135) + Math.abs(planning.anteversion - 20);
  
  // Calculate stability score (0-100)
  const stabilityScore = Math.max(0, 100 - deviation * 2);

  return (
    <div>
      <div className="progress-bar">
        <div style={{ width: `${stabilityScore}%` }} />
      </div>
      <div>{Math.round(stabilityScore)}% Stability</div>
    </div>
  );
}
```

**Formula:**
- Deviation = |angle - 135| + |anteversion - 20|
- Stability = max(0, 100 - deviation × 2)

---

#### WearSimulationTab Component

**Purpose:** Simulate implant wear over time

**Algorithm:**
```typescript
function WearSimulationTab({ planning }: Props) {
  const [progress, setProgress] = useState(0);

  // Animate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => Math.min(100, p + 0.5));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Calculate wear factor
  const wearFactor = (planning.depth / 40) + (Math.abs(planning.offset) / 20);
  const wearLevel = Math.min(100, progress * wearFactor);

  return (
    <div>
      <div className="progress-bar">
        <div style={{ width: `${wearLevel}%` }} />
      </div>
    </div>
  );
}
```

**Formula:**
- Wear Factor = (depth / 40) + (|offset| / 20)
- Wear Level = min(100, progress × wearFactor)

---

#### ImpingementIndicator Component

**Purpose:** Detect and visualize bone/implant impingement

**Algorithm:**
```typescript
function ImpingementIndicator({ motionVals }: Props) {
  // Check impingement conditions
  const isImpingement = motionVals.abduction < 20 || motionVals.flexion > 135;
  
  if (!isImpingement) return null;

  // Determine contact position
  const contactPos = motionVals.abduction < 20 
    ? [-0.2, 0.05, 0.05]  // Subacromial impingement
    : [0.1, 0.25, 0.15];   // Anterior impingement

  return (
    <group position={contactPos}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.7} />
      </mesh>
      {/* Pulsing outer sphere */}
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.2} wireframe />
      </mesh>
    </group>
  );
}
```

**Conditions:**
- Subacromial: abduction < 20°
- Anterior: flexion > 135°

---

#### ForceVectors Component

**Purpose:** Visualize biomechanical force vectors

**Algorithm:**
```typescript
function ForceVectors({ motionVals }: Props) {
  const abdRad = (motionVals.abduction * Math.PI) / 180;
  
  // Calculate joint reaction force magnitude
  const jointForceMag = Math.max(0.3, 0.8 + Math.sin(abdRad) * 0.8);
  const isHighLoad = jointForceMag > 1.25;

  return (
    <group>
      {/* Joint Reaction Force Vector */}
      <group position={[-0.1, 0.3, 0]} rotation={[0, 0, -1.1 + abdRad * 0.5]}>
        <mesh position={[0, jointForceMag / 2, 0]}>
          <cylinderGeometry args={[0.025, 0.025, jointForceMag, 8]} />
          <meshBasicMaterial color={isHighLoad ? "#ef4444" : "#06b6d4"} />
        </mesh>
        <mesh position={[0, jointForceMag + 0.05, 0]}>
          <coneGeometry args={[0.07, 0.15, 8]} />
          <meshBasicMaterial color={isHighLoad ? "#ef4444" : "#06b6d4"} />
        </mesh>
      </group>

      {/* Deltoid Pull Vector */}
      <group position={[0.5, 0.4, 0]} rotation={[0, 0, 0.3 - abdRad * 0.2]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
          <meshBasicMaterial color="#a78bfa" />
        </mesh>
        <mesh position={[0, 0.8 + 0.04, 0]}>
          <coneGeometry args={[0.05, 0.1, 8]} />
          <meshBasicMaterial color="#a78bfa" />
        </mesh>
      </group>
    </group>
  );
}
```

**Formulas:**
- Joint Force = max(0.3, 0.8 + sin(abduction) × 0.8)
- High Load Threshold: > 1.25

---

### DashboardPage.tsx - Surgeon Dashboard

**Purpose:** Surgeon workspace for case management and collaboration

**Component Structure:**
```
DashboardPage
├── OverviewSection (stats and charts)
├── DicomSection (upload workflow)
├── CasesSection (case management)
├── CollaborationSection (team and notes)
└── Sidebar (navigation)
```

**Key Features:**
- Tab-based navigation
- DICOM upload with progress tracking
- Case comparison and management
- Team collaboration features
- Analytics dashboard

---

### Home.tsx - Landing Page

**Purpose:** Marketing and feature showcase

**Component Structure:**
```
Home
├── Navbar (navigation)
├── Hero (main CTA)
├── About (platform stats)
├── Features (feature cards)
├── DashboardPreview (live demo)
├── Research (publications)
├── Testimonials (user quotes)
├── Pricing (plans)
├── Contact (form)
└── Footer
```

**Key Features:**
- Animated hero section
- Feature showcase with interactive cards
- Live dashboard preview
- Scroll animations
- Responsive design

---

## 🌊 Data Flow

### User Interaction Flow

```
User Action → Component State → Calculation → 3D Render → Visual Update
```

**Example: Adjusting Inclination Angle**

1. User moves inclination slider
2. Slider onChange fires
3. setPlanning updates state
4. Component re-renders
5. ScapulaMesh receives new angle prop
6. inclinationRad recalculated
7. 3D mesh rotation updated
8. Stress level recalculated
9. Heatmap color updated
10. Stability score updated

---

### Parameter Flow Diagram

```
Planning Parameters
├── angle → ScapulaMesh rotation → Stress Level → Heatmap
├── anteversion → ScapulaMesh rotation → Stress Level → Heatmap
├── depth → Wear calculation → Wear level
└── offset → HumerusMesh position → Wear calculation

Motion Parameters
├── flexion → HumerusMesh rotation → Impingement check
├── extension → HumerusMesh rotation → Impingement check
├── abduction → HumerusMesh rotation → Force vectors
└── rotation → HumerusMesh rotation → Soft tissue positions
```

---

## 🔢 Key Algorithms

### Stress Level Calculation

**Location:** SimulationPage.tsx (ShoulderSimViewer component)

```typescript
const angleDelta = Math.abs(planning.angle - 135) / 45;
const anteDelta = Math.abs(planning.anteversion - 20) / 20;
const stressLevel = Math.min((angleDelta + anteDelta) / 2, 1);
```

**Explanation:**
1. Calculate deviation from optimal inclination (135°)
2. Normalize by 45° (max acceptable deviation)
3. Calculate deviation from optimal anteversion (20°)
4. Normalize by 20° (max acceptable deviation)
5. Average the two normalized deviations
6. Cap at 1.0 (100% stress)

**Output:** 0.0 (low stress) to 1.0 (high stress)

---

### Stability Score Calculation

**Location:** SimulationPage.tsx (StabilityTab component)

```typescript
const deviation = Math.abs(planning.angle - 135) + Math.abs(planning.anteversion - 20);
const stabilityScore = Math.max(0, 100 - deviation * 2);
```

**Explanation:**
1. Sum absolute deviations from optimal values
2. Multiply by 2 (penalty factor)
3. Subtract from 100 (perfect score)
4. Ensure non-negative

**Output:** 0-100 (higher = more stable)

---

### Wear Simulation

**Location:** SimulationPage.tsx (WearSimulationTab component)

```typescript
const wearFactor = (planning.depth / 40) + (Math.abs(planning.offset) / 20);
const wearLevel = Math.min(100, progress * wearFactor);
```

**Explanation:**
1. Normalize depth by 40mm (max depth)
2. Normalize offset by 20mm (max offset)
3. Sum to get wear factor
4. Multiply by time progress
5. Cap at 100%

**Output:** 0-100% wear over time

---

### Impingement Detection

**Location:** SimulationPage.tsx (ImpingementIndicator component)

```typescript
const isImpingement = motionVals.abduction < 20 || motionVals.flexion > 135;
```

**Explanation:**
- Simple threshold-based detection
- Subacromial: abduction < 20°
- Anterior: flexion > 135°
- Logical OR (either condition triggers)

**Output:** boolean (true = impingement detected)

---

### Force Vector Calculation

**Location:** SimulationPage.tsx (ForceVectors component)

```typescript
const abdRad = (motionVals.abduction * Math.PI) / 180;
const jointForceMag = Math.max(0.3, 0.8 + Math.sin(abdRad) * 0.8);
```

**Explanation:**
1. Convert abduction to radians
2. Calculate sine of abduction
3. Scale by 0.8 (abduction influence)
4. Add base force (0.8)
5. Ensure minimum force (0.3)

**Output:** Force magnitude (0.3 to 1.6)

---

## 📊 State Management

### Local State Pattern

The application uses React's built-in useState for all state management:

```typescript
// Simple state
const [isOpen, setIsOpen] = useState(false);

// Object state
const [planning, setPlanning] = useState<PlanningValues>({
  angle: 135,
  anteversion: 20,
  depth: 28,
  offset: 0,
});

// Set state (immutable pattern)
setPlanning(prev => ({ ...prev, angle: newValue }));
```

### State Lifting

When child components need to modify parent state:

```typescript
// Parent
const [value, setValue] = useState(0);
<Child value={value} onChange={setValue} />

// Child
interface Props {
  value: number;
  onChange: (val: number) => void;
}
const handleChange = (newVal: number) => {
  props.onChange(newVal);
};
```

### State Persistence

Not currently implemented. Future enhancement:

```typescript
// Use localStorage
useEffect(() => {
  localStorage.setItem('planning', JSON.stringify(planning));
}, [planning]);

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('planning');
  if (saved) setPlanning(JSON.parse(saved));
}, []);
```

---

## 🎨 3D Rendering Pipeline

### Render Loop

Three.js uses a continuous render loop via @react-three/fiber:

```typescript
useFrame((state, delta) => {
  // state.clock.getElapsedTime() - time since start
  // delta - time since last frame
  // Animation logic here
});
```

### Component Lifecycle

1. **Mount:** Component initializes, refs attached
2. **Render:** JSX converted to Three.js objects
3. **Frame Loop:** useFrame hooks execute
4. **Update:** State changes trigger re-render
5. **Unmount:** Cleanup in useEffect return

### Geometry Types Used

- **BoxGeometry:** Scapula body
- **CylinderGeometry:** Glenoid neck, humeral shaft, implant stem
- **SphereGeometry:** Humeral head, glenosphere
- **Line:** Muscles, tendons, nerves (via ThreeLine)

### Material Types

- **meshStandardMaterial:** Realistic lighting response
- **meshBasicMaterial:** Unlit (for heatmaps, wireframes)
- **Transparency:** opacity property for layers

### Lighting Setup

```typescript
<ambientLight intensity={0.5} />  // Ambient fill
<pointLight position={[10, 10, 10]} intensity={1.5} />  // Directional light
```

---

## 📄 File-by-File Explanation

### Main Application Files

#### `src/main.tsx`
- **Purpose:** Application entry point
- **Responsibilities:** Mount React app to DOM
- **Code:** Simple render call

#### `src/App.tsx`
- **Purpose:** Root component with routing
- **Responsibilities:** Route configuration, providers
- **Key Sections:** QueryClient, Router, Providers

#### `src/index.css`
- **Purpose:** Global styles and Tailwind directives
- **Contents:** Tailwind imports, custom CSS variables

---

### Page Components

#### `src/pages/Home.tsx` (1926 lines)
- **Purpose:** Landing page
- **Key Sections:**
  - Navbar with navigation
  - Hero with 3D visualization
  - About/Stats section
  - Features grid
  - Dashboard preview
  - Research section
  - Testimonials
  - Contact form
  - Footer
- **Custom Hooks:** useTheme, useCounter
- **Animations:** Framer Motion variants

#### `src/pages/SimulationPage.tsx` (1312 lines)
- **Purpose:** Main simulation interface
- **Key Sections:**
  - Planning controls
  - Motion controls
  - 3D viewer
  - CT slice viewer
  - Analysis tabs
  - Surgical report modal
- **3D Components:** ScapulaMesh, HumerusMesh, SoftTissueLayers
- **Analysis:** StabilityTab, WearSimulationTab, ImpingementIndicator
- **Data:** patients array, recoveryData array

#### `src/pages/DashboardPage.tsx` (448 lines)
- **Purpose:** Surgeon dashboard
- **Key Sections:**
  - Overview with charts
  - DICOM upload
  - Case management
  - Collaboration features
- **Data:** savedCases, monthlyData, outcomeData, teamMembers

#### `src/pages/ImplantLibraryPage.tsx` (282 lines)
- **Purpose:** Implant catalog
- **Features:** Filter, search, compare implants

#### `src/pages/SurgeonTrainingPage.tsx` (36 lines)
- **Purpose:** Training module placeholder
- **Status:** Minimal implementation

---

### UI Components

#### `src/components/ui/` (55 files)
- **Purpose:** Reusable UI components
- **Library:** shadcn/ui (Radix UI + Tailwind)
- **Components:**
  - button.tsx, input.tsx, card.tsx
  - dialog.tsx, dropdown-menu.tsx
  - slider.tsx, select.tsx
  - chart.tsx (Recharts wrapper)
  - And 50+ more

---

### Hooks

#### `src/hooks/use-toast.ts`
- **Purpose:** Toast notification management
- **Features:** Add, remove, update toasts
- **Usage:** Custom hook for toast state

---

### Utilities

#### `src/lib/utils.ts`
- **Purpose:** Helper functions
- **Contents:** cn() (className merger)

---

## 🔧 Configuration Files

### `vite.config.ts`
- **Purpose:** Vite build configuration
- **Settings:** Plugins, dev server, build options

### `tsconfig.json`
- **Purpose:** TypeScript configuration
- **Settings:** Compiler options, path aliases

### `components.json`
- **Purpose:** shadcn/ui configuration
- **Settings:** Component paths, styling

### `tailwind.config.js`
- **Purpose:** Tailwind CSS configuration
- **Settings:** Theme, plugins, content paths

---

## 🚀 Build Process

### Development Build

```bash
pnpm dev
```

1. Vite dev server starts
2. TypeScript compilation (on-demand)
3. Hot module replacement
4. File watching

### Production Build

```bash
pnpm build
```

1. TypeScript type checking
2. Code bundling (Rollup)
3. Minification
4. Tree shaking
5. Output to `dist/` folder

---

## 🐛 Debugging Tips

### Common Issues

**3D Model Not Rendering:**
- Check if layers state includes "bones"
- Verify Canvas component has parent with dimensions
- Check browser console for Three.js errors

**Parameters Not Updating:**
- Verify onChange handler is connected
- Check state update is immutable
- Use React DevTools to inspect state

**Performance Issues:**
- Reduce geometry segment counts
- Disable shadows in production
- Use React.memo for expensive components

### Browser DevTools

**React DevTools:**
- Inspect component tree
- View props and state
- Profile performance

**Three.js Inspector:**
- Inspect 3D scene graph
- View material properties
- Debug transformations

---

## 📚 Additional Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
