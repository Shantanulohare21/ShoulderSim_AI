# Project Structure Guide - ShoulderSim AI

## Overview

This document explains the professional project structure implemented for ShoulderSim AI. The restructure follows industry best practices for scalability, maintainability, and developer experience.

---

## 📁 Directory Structure

```
ShoulderSim_AI/
├── artifacts/                          # Built applications
│   ├── shouldersim-ai/                # Main React application
│   │   ├── public/                    # Static assets
│   │   │   ├── vite.svg
│   │   │   └── ...
│   │   ├── src/                       # Source code
│   │   │   ├── components/            # React components
│   │   │   │   └── ui/               # UI component library (shadcn/ui)
│   │   │   │       ├── button.tsx
│   │   │   │       ├── card.tsx
│   │   │   │       ├── dialog.tsx
│   │   │   │       └── ... (55+ components)
│   │   │   ├── pages/                 # Page-level components
│   │   │   │   ├── Home.tsx           # Landing page
│   │   │   │   ├── SimulationPage.tsx # Main simulation interface
│   │   │   │   ├── DashboardPage.tsx  # Surgeon dashboard
│   │   │   │   ├── ImplantLibraryPage.tsx
│   │   │   │   ├── SurgeonTrainingPage.tsx
│   │   │   │   └── not-found.tsx
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   │   └── use-toast.ts
│   │   │   ├── types/                 # TypeScript type definitions ⭐ NEW
│   │   │   │   └── index.ts
│   │   │   ├── constants/             # Configuration constants ⭐ NEW
│   │   │   │   └── index.ts
│   │   │   ├── utils/                 # Utility functions ⭐ NEW
│   │   │   │   ├── biomechanics.ts    # Biomechanical calculations
│   │   │   │   └── helpers.ts         # General helpers
│   │   │   ├── lib/                   # Library utilities
│   │   │   │   └── utils.ts
│   │   │   ├── App.tsx                # Root component
│   │   │   ├── main.tsx               # Entry point
│   │   │   └── index.css              # Global styles
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── components.json
│   ├── api-server/                    # Backend API (placeholder)
│   └── mockup-sandbox/                # Design mockups
├── lib/                               # Shared libraries
│   ├── api-client-react/              # React API client
│   ├── api-spec/                      # API specifications
│   ├── api-zod/                       # Zod validation schemas
│   └── db/                            # Database utilities
├── scripts/                           # Build and utility scripts
├── docs/                              # Documentation ⭐ NEW
│   ├── PARAMETER_DOCUMENTATION.md     # Parameter reference
│   ├── CODE_DOCUMENTATION.md          # Code explanation
│   ├── INTERVIEW_PREP.md              # Interview questions
│   └── PROJECT_STRUCTURE.md           # This file
├── package.json                       # Root package.json
├── pnpm-workspace.yaml                # PNPM workspace config
├── tsconfig.json                      # Root TypeScript config
└── README.md                          # Project README ⭐ UPDATED
```

---

## 🎯 Key Improvements

### 1. Centralized Type Definitions (`src/types/`)

**Purpose:** Single source of truth for all TypeScript types

**Benefits:**
- Type consistency across the application
- Easier to maintain and update
- Better IDE autocomplete
- Reduced code duplication

**Contents:**
- Interface definitions (PlanningValues, MotionValues, etc.)
- Type aliases (LayerKey, ViewMode, etc.)
- Component prop types
- Data structure types

**Usage Example:**
```typescript
import { PlanningValues, MotionValues } from "@/types";

const planning: PlanningValues = {
  angle: 135,
  anteversion: 20,
  depth: 28,
  offset: 0,
};
```

---

### 2. Configuration Constants (`src/constants/`)

**Purpose:** Centralized configuration values

**Benefits:**
- Easy to tune parameters without searching code
- Single place to update defaults
- Better documentation of magic numbers
- Easier testing with different values

**Contents:**
- Optimal planning parameters
- Acceptable ranges
- Thresholds for calculations
- 3D geometry parameters
- Material colors
- Animation settings

**Usage Example:**
```typescript
import { OPTIMAL_PLANNING, STRESS_COLORS } from "@/constants";

const optimalAngle = OPTIMAL_PLANNING.INCLINATION; // 135
const lowStressColor = STRESS_COLORS.LOW; // "#22c55e"
```

---

### 3. Utility Functions (`src/utils/`)

**Purpose:** Reusable calculation and helper functions

**Benefits:**
- Separation of concerns
- Easier to test
- Reusable across components
- Better code organization

**Files:**

#### `biomechanics.ts`
- Stress level calculations
- Stability score calculations
- Wear simulation
- Impingement detection
- Force vector calculations
- Motion rotation calculations
- Parameter validation

#### `helpers.ts`
- Number formatting
- Array manipulation
- String utilities
- Date utilities
- Debounce/throttle
- General helpers

**Usage Example:**
```typescript
import { calculateStressLevel, calculateStabilityScore } from "@/utils/biomechanics";
import { formatNumber, debounce } from "@/utils/helpers";

const stress = calculateStressLevel(planning);
const stability = calculateStabilityScore(planning);
const formatted = formatNumber(stability, 1);
```

---

## 📋 File Organization Principles

### 1. Separation of Concerns

Each directory has a single, well-defined responsibility:
- `types/` - Type definitions only
- `constants/` - Configuration values only
- `utils/` - Pure functions only
- `components/` - UI components only
- `pages/` - Route components only

### 2. Clear Naming Conventions

- **Files:** kebab-case for utilities, PascalCase for components
- **Directories:** lowercase, descriptive names
- **Constants:** UPPER_SNAKE_CASE
- **Types:** PascalCase for interfaces, camelCase for type aliases

### 3. Import Paths

Use path aliases for cleaner imports:
```typescript
// Instead of:
import { PlanningValues } from "../../../types";

// Use:
import { PlanningValues } from "@/types";
```

### 4. Export Patterns

**Named exports (preferred):**
```typescript
export function calculateStressLevel() {}
export const OPTIMAL_PLANNING = {};
```

**Default exports (rare, for components):**
```typescript
export default function SimulationPage() {}
```

---

## 🔧 Migration Guide

### Before (Old Structure)

```typescript
// Types defined inline in components
interface PlanningValues {
  angle: number;
  anteversion: number;
  // ...
}

// Magic numbers scattered in code
const deviation = Math.abs(angle - 135) + Math.abs(anteversion - 20);

// Calculations in components
const stressLevel = Math.min((angleDelta + anteDelta) / 2, 1);
```

### After (New Structure)

```typescript
// Import types from centralized location
import { PlanningValues } from "@/types";

// Use named constants
import { OPTIMAL_PLANNING, STRESS_PARAMETERS } from "@/constants";

// Use utility functions
import { calculateStressLevel } from "@/utils/biomechanics";

const stressLevel = calculateStressLevel(planning);
```

---

## 📝 Adding New Features

### Step 1: Define Types

Add to `src/types/index.ts`:
```typescript
export interface NewFeatureProps {
  prop1: string;
  prop2: number;
}
```

### Step 2: Add Constants (if needed)

Add to `src/constants/index.ts`:
```typescript
export const NEW_FEATURE_CONFIG = {
  defaultValue: 100,
  maxLimit: 200,
} as const;
```

### Step 3: Add Utility Functions (if needed)

Add to `src/utils/biomechanics.ts` or create new file:
```typescript
export function calculateNewFeature(params: NewFeatureProps): number {
  // Calculation logic
}
```

### Step 4: Create Component

Add to appropriate location:
```typescript
import { NewFeatureProps } from "@/types";
import { NEW_FEATURE_CONFIG } from "@/constants";
import { calculateNewFeature } from "@/utils/biomechanics";

export function NewFeature({ prop1, prop2 }: NewFeatureProps) {
  // Component implementation
}
```

---

## 🧪 Testing Strategy

### Unit Tests

Test utility functions in isolation:
```typescript
// src/utils/__tests__/biomechanics.test.ts
import { calculateStressLevel } from "../biomechanics";

describe("calculateStressLevel", () => {
  it("returns 0 for optimal parameters", () => {
    const result = calculateStressLevel({
      angle: 135,
      anteversion: 20,
      depth: 28,
      offset: 0,
    });
    expect(result).toBe(0);
  });
});
```

### Integration Tests

Test component interactions:
```typescript
// src/pages/__tests__/SimulationPage.test.tsx
import { render, screen } from "@testing-library/react";
import SimulationPage from "../SimulationPage";

describe("SimulationPage", () => {
  it("renders planning controls", () => {
    render(<SimulationPage />);
    expect(screen.getByText("Inclination")).toBeInTheDocument();
  });
});
```

---

## 📊 Code Metrics

### Before Restructure
- Types scattered across 5+ files
- Magic numbers throughout codebase
- Duplicate calculations in components
- No centralized configuration

### After Restructure
- All types in single file (src/types/index.ts)
- All constants in single file (src/constants/index.ts)
- Reusable utility functions
- Clear separation of concerns

---

## 🎓 Best Practices Implemented

### 1. DRY (Don't Repeat Yourself)
- Single source of truth for types
- Reusable utility functions
- Shared constants

### 2. SOLID Principles
- **S**ingle Responsibility: Each file has one purpose
- **O**pen/Closed: Easy to extend without modifying
- **L**iskov Substitution: Consistent interfaces
- **I**nterface Segregation: Small, focused interfaces
- **D**ependency Inversion: Depend on abstractions

### 3. Clean Code
- Descriptive names
- Small functions
- Minimal nesting
- Clear comments

### 4. TypeScript Best Practices
- Strict type checking
- No `any` types
- Proper interface definitions
- Type guards where needed

---

## 🚀 Future Enhancements

### Planned Improvements

1. **3D Components Organization**
   - Create `src/components/3d/` directory
   - Separate ScapulaMesh, HumerusMesh, etc.
   - Add 3D-specific utilities

2. **API Integration**
   - Create `src/services/` for API calls
   - Add React Query hooks
   - Implement error handling

3. **State Management**
   - Add Zustand for global state
   - Create store slices for different features
   - Implement persistence

4. **Testing**
   - Add Jest configuration
   - Write unit tests for utilities
   - Add component tests

5. **Documentation**
   - Add JSDoc comments to all functions
   - Create component storybook
   - Add architecture diagrams

---

## 📚 Related Documentation

- **README.md** - Project overview and setup
- **docs/PARAMETER_DOCUMENTATION.md** - Parameter reference guide
- **docs/CODE_DOCUMENTATION.md** - Detailed code explanation
- **docs/INTERVIEW_PREP.md** - Interview preparation questions

---

## 🤝 Contributing

When contributing to this project:

1. **Follow the structure:** Use existing directories and patterns
2. **Add types:** Define types in `src/types/index.ts`
3. **Use constants:** Add configuration to `src/constants/index.ts`
4. **Extract logic:** Move calculations to `src/utils/`
5. **Update docs:** Keep documentation in sync

---

## 📞 Support

For questions about the project structure:
- Refer to this document
- Check CODE_DOCUMENTATION.md for implementation details
- Review PARAMETER_DOCUMENTATION.md for parameter information
