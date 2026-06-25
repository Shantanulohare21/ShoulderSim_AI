# Parameter Documentation - ShoulderSim AI

## Overview

This document explains how different parameters contribute to the simulated output in ShoulderSim AI, where to modify them, and their biomechanical significance.

---

## 📋 Table of Contents

1. [Implant Planning Parameters](#implant-planning-parameters)
2. [Motion/Range of Motion Parameters](#motionrange-of-motion-parameters)
3. [Visualization Parameters](#visualization-parameters)
4. [Simulation Engine Parameters](#simulation-engine-parameters)
5. [Patient Data Parameters](#patient-data-parameters)
6. [Where to Modify Parameters](#where-to-modify-parameters)

---

## 🔧 Implant Planning Parameters

### Location: `src/pages/SimulationPage.tsx`

### Interface Definition

```typescript
interface PlanningValues {
  angle: number;        // Inclination angle (degrees)
  anteversion: number;  // Anteversion angle (degrees)
  depth: number;       // Implant depth (mm)
  offset: number;      // Humeral offset (mm)
}
```

### Parameter Details

#### 1. Inclination Angle (`angle`)

**Default Value:** 135°
**Range:** 90° - 180°
**Optimal Range:** 130° - 145°

**Biomechanical Significance:**
- Controls the glenoid component inclination relative to the scapular body
- Affects joint reaction force vector
- Influences stability and range of motion
- Critical for preventing scapular notching

**Impact on Simulation:**
- **3D Model:** Rotates the glenosphere in the coronal plane
- **Stability Score:** Deviation from 135° reduces stability
- **Stress Heatmap:** Higher deviation increases stress (red zones)
- **CT Slices:** Changes glenoid profile in coronal view

**Calculation:**
```typescript
const inclinationRad = ((planning.angle - 135) * Math.PI) / 180;
```

**Where to Modify:**
- **UI Controls:** SimulationPage.tsx, lines ~810-850 (slider controls)
- **Default Value:** Initial state in SimulationPage component
- **Validation:** Add validation in the onChange handler

---

#### 2. Anteversion Angle (`anteversion`)

**Default Value:** 20°
**Range:** 0° - 40°
**Optimal Range:** 15° - 25°

**Biomechanical Significance:**
- Controls forward/backward tilt of the glenoid
- Affects anterior-posterior stability
- Influences external rotation range
- Critical for preventing anterior dislocation

**Impact on Simulation:**
- **3D Model:** Rotates glenosphere in the sagittal plane
- **Stability Score:** Deviation from 20° reduces stability
- **CT Slices:** Changes glenoid ellipse in axial view
- **Impingement:** Affects anterior impingement risk

**Calculation:**
```typescript
const anteversionRad = ((planning.anteversion - 20) * Math.PI) / 180;
```

**Where to Modify:**
- **UI Controls:** SimulationPage.tsx, slider component
- **Default Value:** Initial state
- **Validation:** Range checking in input handler

---

#### 3. Implant Depth (`depth`)

**Default Value:** 28mm
**Range:** 15mm - 45mm
**Optimal Range:** 25mm - 35mm

**Biomechanical Significance:**
- How deep the implant is seated in the glenoid
- Affects joint compression and stability
- Influences glenoid bone stock preservation
- Impacts soft tissue tension

**Impact on Simulation:**
- **Wear Simulation:** Higher depth accelerates wear
- **3D Model:** Changes implant position along glenoid axis
- **CT Slices:** Affects cross-sectional size in all views
- **Stress:** Deeper seating may increase edge loading

**Calculation:**
```typescript
const wearFactor = (planning.depth / 40) + (Math.abs(planning.offset) / 20);
```

**Where to Modify:**
- **UI Controls:** Depth slider in planning panel
- **Wear Formula:** WearSimulationTab component
- **Validation:** Min/max depth constraints

---

#### 4. Humeral Offset (`offset`)

**Default Value:** 0mm
**Range:** -20mm to +20mm
**Optimal Range:** -5mm to +5mm

**Biomechanical Significance:**
- Lateral/medial position of humeral component
- Affects deltoid tension and leverage
- Influences abduction strength
- Impacts joint center of rotation

**Impact on Simulation:**
- **3D Model:** Shifts humeral head laterally/medially
- **CT Slices:** Changes humeral head position in all views
- **Force Vectors:** Alters joint reaction force direction
- **Wear:** Higher offset increases wear rate

**Calculation:**
```typescript
const humeralOffset = planning.offset / 10;
```

**Where to Modify:**
- **UI Controls:** Offset slider
- **3D Position:** HumerusMesh component position prop
- **CT Drawing:** Slice viewer offset calculations

---

## 🏃 Motion/Range of Motion Parameters

### Location: `src/pages/SimulationPage.tsx`

### Interface Definition

```typescript
interface MotionValues {
  flexion: number;      // Forward elevation (degrees)
  extension: number;    // Backward extension (degrees)
  abduction: number;    // Lateral elevation (degrees)
  rotation: number;     // Internal/external rotation (degrees)
}
```

### Parameter Details

#### 1. Flexion (`flexion`)

**Default Value:** 90°
**Range:** 0° - 180°
**Normal Range:** 150° - 180° (healthy shoulder)

**Biomechanical Significance:**
- Forward elevation of the arm
- Critical for daily activities (reaching overhead)
- Affected by implant positioning
- Limited by impingement and soft tissue tension

**Impact on Simulation:**
- **3D Model:** Rotates humerus around X-axis
- **Impingement Detection:** >135° triggers impingement warning
- **Soft Tissue:** Changes muscle/tendon line positions
- **Force Vectors:** Alters deltoid pull direction

**Calculation:**
```typescript
const rotX = (flexion * Math.PI) / 180;
groupRef.current.rotation.set(-rotX, rotY, -rotZ);
```

**Where to Modify:**
- **UI Controls:** Flexion slider in motion panel
- **Impingement Threshold:** ImpingementIndicator component
- **Animation:** useFrame hook for simulation mode

---

#### 2. Extension (`extension`)

**Default Value:** 30°
**Range:** 0° - 60°
**Normal Range:** 45° - 60° (healthy shoulder)

**Biomechanical Significance:**
- Backward movement of the arm
- Limited by posterior capsule tightness
- Affected by implant retroversion
- Important for reaching behind

**Impact on Simulation:**
- **3D Model:** Negative rotation around X-axis
- **Combined with Abduction:** Net Z-axis rotation
- **Impingement:** Posterior impingement detection

**Calculation:**
```typescript
const rotZ = ((abd - ext) * Math.PI) / 180;
```

**Where to Modify:**
- **UI Controls:** Extension slider
- **Rotation Logic:** HumerusMesh useFrame hook

---

#### 3. Abduction (`abduction`)

**Default Value:** 90°
**Range:** 0° - 180°
**Normal Range:** 150° - 180° (healthy shoulder)

**Biomechanical Significance:**
- Lateral elevation of the arm
- Most critical motion for daily function
- Heavily influenced by deltoid function
- Primary indicator of surgical success

**Impact on Simulation:**
- **3D Model:** Rotation around Z-axis
- **Impingement:** <20° triggers subacromial impingement
- **Force Vectors:** Changes joint reaction force magnitude
- **Soft Tissue:** Dynamic muscle attachment points

**Calculation:**
```typescript
const jointForceMag = Math.max(0.3, 0.8 + Math.sin(abdRad) * 0.8);
const humAttachY = -0.3 - Math.sin(abdRad) * 0.5;
```

**Where to Modify:**
- **UI Controls:** Abduction slider
- **Force Calculation:** ForceVectors component
- **Impingement Threshold:** ImpingementIndicator

---

#### 4. Rotation (`rotation`)

**Default Value:** 0°
**Range:** -90° to +90°
**Normal Range:** -90° (internal) to +90° (external)

**Biomechanical Significance:**
- Internal/external rotation with arm at side
- Critical for activities like reaching behind back
- Affected by implant versioning
- Influences stability in different positions

**Impact on Simulation:**
- **3D Model:** Rotation around Y-axis
- **Stability:** Affects dynamic stability
- **Soft Tissue:** Rotates muscle attachment points

**Calculation:**
```typescript
const rotY = (rot * Math.PI) / 180;
```

**Where to Modify:**
- **UI Controls:** Rotation slider
- **Rotation Logic:** HumerusMesh component

---

## 👁️ Visualization Parameters

### Layer Visibility

**Location:** `src/pages/SimulationPage.tsx`

**Type:** `Set<LayerKey>` where `LayerKey = "bones" | "muscles" | "tendons" | "cartilage" | "implant" | "nerves"`

**Parameters:**

1. **Bones** - Scapula and humerus geometry
2. **Muscles** - Supraspinatus, deltoid representations
3. **Tendons** - Rotator cuff tendon pathways
4. **Cartilage** - Glenoid cartilage layer
5. **Implant** - Prosthetic components
6. **Nerves** - Brachial plexus visualization

**Impact:**
- Toggles visibility of anatomical layers in 3D view
- Affects CT slice rendering (implant layer)
- Does not affect biomechanical calculations

**Where to Modify:**
- **UI Controls:** Layer toggle buttons
- **State Management:** `layers` state variable
- **Conditional Rendering:** Component props

---

### Heatmap Toggle

**Location:** `src/pages/SimulationPage.tsx`

**Type:** `boolean`

**Purpose:**
- Shows stress distribution on implant surface
- Color coding: Green (low) → Yellow (medium) → Red (high)
- Based on parameter deviation from optimal

**Calculation:**
```typescript
const angleDelta = Math.abs(planning.angle - 135) / 45;
const anteDelta = Math.abs(planning.anteversion - 20) / 20;
const stressLevel = Math.min((angleDelta + anteDelta) / 2, 1);
```

**Where to Modify:**
- **UI Controls:** Heatmap toggle button
- **Stress Calculation:** Stress level formula
- **Color Thresholds:** Stress color mapping

---

### View Mode

**Location:** `src/pages/SimulationPage.tsx`

**Type:** `"3d" | "ct" | "vr"`

**Options:**
1. **3D** - Standard 3D kinematic view
2. **CT** - Multi-planar reconstruction (axial, coronal, sagittal)
3. **VR** - Stereoscopic side-by-side view

**Where to Modify:**
- **UI Controls:** View mode selector buttons
- **Rendering Logic:** Conditional component rendering

---

## ⚙️ Simulation Engine Parameters

### Stress Level Calculation

**Location:** `src/pages/SimulationPage.tsx`

**Formula:**
```typescript
const angleDelta = Math.abs(planning.angle - 135) / 45;
const anteDelta = Math.abs(planning.anteversion - 20) / 20;
const stressLevel = Math.min((angleDelta + anteDelta) / 2, 1);
```

**Parameters:**
- `angleDelta`: Normalized deviation from optimal inclination (0-1)
- `anteDelta`: Normalized deviation from optimal anteversion (0-1)
- `stressLevel`: Combined stress metric (0-1)

**Impact:**
- Heatmap color intensity
- Stability score calculation
- Warning indicators

**Where to Modify:**
- **Optimal Values:** Change 135 and 20 to different targets
- **Normalization Divisors:** Adjust 45 and 20 for sensitivity
- **Combination Formula:** Change weighting of each parameter

---

### Stability Score

**Location:** `src/pages/SimulationPage.tsx` (StabilityTab component)

**Formula:**
```typescript
const deviation = Math.abs(planning.angle - 135) + Math.abs(planning.anteversion - 20);
const stabilityScore = Math.max(0, 100 - deviation * 2);
```

**Parameters:**
- `deviation`: Sum of absolute deviations from optimal
- `stabilityScore`: 0-100 score

**Impact:**
- Visual stability indicator
- Color coding (green/yellow/red)
- Surgical recommendation

**Where to Modify:**
- **Multiplier:** Change `* 2` to adjust sensitivity
- **Optimal Values:** Modify target angles
- **Scoring Formula:** Implement more complex biomechanical model

---

### Wear Simulation

**Location:** `src/pages/SimulationPage.tsx` (WearSimulationTab component)

**Formula:**
```typescript
const wearFactor = (planning.depth / 40) + (Math.abs(planning.offset) / 20);
const wearLevel = Math.min(100, progress * wearFactor);
```

**Parameters:**
- `wearFactor`: Combined depth and offset influence
- `progress`: Time-based simulation (0-100)
- `wearLevel`: Final wear percentage

**Impact:**
- Wear progression visualization
- Long-term outcome prediction
- Implant selection guidance

**Where to Modify:**
- **Depth Coefficient:** Change `/ 40` divisor
- **Offset Coefficient:** Change `/ 20` divisor
- **Progress Rate:** Adjust simulation speed
- **Wear Model:** Implement more sophisticated wear algorithm

---

### Impingement Detection

**Location:** `src/pages/SimulationPage.tsx` (ImpingementIndicator component)

**Conditions:**
```typescript
const isImpingement = motionVals.abduction < 20 || motionVals.flexion > 135;
```

**Parameters:**
- `abduction < 20`: Subacromial impingement threshold
- `flexion > 135`: Anterior impingement threshold

**Impact:**
- Visual collision indicator (red sphere)
- Warning messages
- Motion range recommendations

**Where to Modify:**
- **Abduction Threshold:** Change `20` to different value
- **Flexion Threshold:** Change `135` to different value
- **Contact Position:** Adjust collision sphere coordinates

---

### Force Vector Calculations

**Location:** `src/pages/SimulationPage.tsx` (ForceVectors component)

**Joint Reaction Force:**
```typescript
const abdRad = (motionVals.abduction * Math.PI) / 180;
const jointForceMag = Math.max(0.3, 0.8 + Math.sin(abdRad) * 0.8);
```

**Parameters:**
- Base force: 0.8
- Abduction influence: sin(abduction) * 0.8
- Minimum force: 0.3

**Where to Modify:**
- **Base Force:** Change `0.8`
- **Abduction Coefficient:** Change `* 0.8`
- **Minimum Force:** Change `0.3`
- **Force Direction:** Rotation angles in group component

---

## 👤 Patient Data Parameters

### Location: `src/pages/SimulationPage.tsx`

### Patient Array

```typescript
const patients = [
  { 
    id: "P-2024-0142", 
    name: "James R., 67M", 
    diagnosis: "Glenohumeral OA Stage IV", 
    implant: "Total Shoulder Arthroplasty" 
  },
  // ... more patients
];
```

**Parameters:**
- `id`: Unique patient identifier
- `name`: Patient demographics
- `diagnosis`: Clinical diagnosis
- `implant`: Recommended implant type

**Where to Modify:**
- **Add Patients:** Add objects to patients array
- **Patient Selection:** Update selectedPatient state
- **Data Source:** Replace with API call in production

---

### Recovery Data

**Location:** `src/pages/SimulationPage.tsx`

```typescript
const recoveryData = [
  { week: "0", rom: 20, pain: 80, strength: 10 },
  { week: "2", rom: 35, pain: 65, strength: 18 },
  // ... more weeks
];
```

**Parameters:**
- `week`: Time point (weeks post-op)
- `rom`: Range of motion (degrees)
- `pain`: Pain level (0-100 scale)
- `strength`: Strength percentage (0-100)

**Where to Modify:**
- **Timeline:** Add/remove week data points
- **Values:** Adjust recovery progression
- **Data Source:** Replace with patient-specific data

---

## 📍 Where to Modify Parameters

### Quick Reference Guide

| Parameter Type | File Location | Line Range | Modification Method |
|----------------|---------------|------------|-------------------|
| Implant Planning | SimulationPage.tsx | ~15-17 | Interface definition |
| Planning Defaults | SimulationPage.tsx | ~750-780 | useState initial values |
| Planning UI Controls | SimulationPage.tsx | ~810-850 | Slider components |
| Motion Parameters | SimulationPage.tsx | ~17 | Interface definition |
| Motion Defaults | SimulationPage.tsx | ~750-780 | useState initial values |
| Motion UI Controls | SimulationPage.tsx | ~850-900 | Slider components |
| Stress Calculation | SimulationPage.tsx | ~763-765 | Formula in ShoulderSimViewer |
| Stability Score | SimulationPage.tsx | ~44-56 | StabilityTab component |
| Wear Simulation | SimulationPage.tsx | ~59-78 | WearSimulationTab component |
| Impingement Threshold | SimulationPage.tsx | ~464 | ImpingementIndicator condition |
| Force Vectors | SimulationPage.tsx | ~486-520 | ForceVectors component |
| Patient Data | SimulationPage.tsx | ~19-23 | patients array |
| Recovery Data | SimulationPage.tsx | ~25-35 | recoveryData array |
| Layer Visibility | SimulationPage.tsx | ~750-780 | layers state |
| 3D Model Geometry | SimulationPage.tsx | ~81-270 | ScapulaMesh, HumerusMesh components |

---

### Adding New Parameters

#### Step 1: Define Interface

```typescript
// Add to existing interfaces or create new
interface NewParameterValues {
  newParam: number;
  // ... other params
}
```

#### Step 2: Add State

```typescript
const [newParams, setNewParams] = useState<NewParameterValues>({
  newParam: defaultValue,
});
```

#### Step 3: Create UI Control

```typescript
<div className="space-y-2">
  <label className="text-xs font-medium">New Parameter</label>
  <Slider
    value={[newParams.newParam]}
    onValueChange={(v) => setNewParams(p => ({ ...p, newParam: v[0] }))}
    min={minValue}
    max={maxValue}
  />
  <div className="text-xs text-muted-foreground">{newParams.newParam}</div>
</div>
```

#### Step 4: Implement Calculation

```typescript
// Add calculation logic where needed
const result = calculateSomething(newParams.newParam);
```

#### Step 5: Update 3D Model

```typescript
// Pass to 3D components
<ScapulaMesh newParam={newParams.newParam} />
```

---

### Removing Parameters

#### Step 1: Remove from Interface

```typescript
// Remove parameter from interface
interface PlanningValues {
  // oldParam: number;  // Remove this line
}
```

#### Step 2: Remove State

```typescript
// Remove from useState
const [planning, setPlanning] = useState<PlanningValues>({
  // oldParam: defaultValue,  // Remove this line
});
```

#### Step 3: Remove UI Control

```typescript
// Remove slider/control component
{/* Remove this entire block */}
```

#### Step 4: Remove Calculations

```typescript
// Remove any calculations using the parameter
// const result = calculateSomething(planning.oldParam);  // Remove
```

#### Step 5: Update 3D Components

```typescript
// Remove prop from component calls
<ScapulaMesh /* oldParam={planning.oldParam} */ />
```

---

## 🔬 Biomechanical Notes

### Clinical Significance

1. **Inclination Angle**
   - Too high (>150°): Increased scapular notching risk
   - Too low (<125°): Inferior instability, reduced ROM
   - Optimal: 130°-145° for most patients

2. **Anteversion**
   - Too high (>30°): Anterior instability
   - Too low (<10°): Posterior instability, reduced ER
   - Optimal: 15°-25° based on patient anatomy

3. **Depth**
   - Too deep (>35mm): Overstuffing, stiffness
   - Too shallow (<20mm): Instability, loosening
   - Optimal: 25mm-35mm based on bone stock

4. **Offset**
   - Positive offset: Improved deltoid tension
   - Negative offset: Reduced tension, may cause instability
   - Optimal: -5mm to +5mm

### Limitations

- Current model uses simplified biomechanics
- Does not account for individual patient anatomy
- Soft tissue modeling is approximate
- Wear simulation is simplified
- Real surgical outcomes may vary

### Future Enhancements

- Patient-specific bone geometry from CT
- Finite element analysis for stress
- Machine learning for outcome prediction
- Real-time haptic feedback
- Integration with surgical navigation

---

## 📞 Support

For questions about parameter modification or biomechanical calculations, refer to:
- Main README.md for project overview
- CODE_DOCUMENTATION.md for code structure
- INTERVIEW_PREP.md for technical interview preparation
