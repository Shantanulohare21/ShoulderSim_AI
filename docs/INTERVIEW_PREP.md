# Interview Preparation Guide - ShoulderSim AI

## Overview

This document contains comprehensive interview questions and answers about the ShoulderSim AI project, covering technical implementation, architecture, decision-making, and domain knowledge.

---

## 📋 Table of Contents

1. [Project Overview Questions](#project-overview-questions)
2. [Technical Architecture Questions](#technical-architecture-questions)
3. [React & Frontend Questions](#react--frontend-questions)
4. [3D Graphics & Three.js Questions](#3d-graphics--threejs-questions)
5. [State Management Questions](#state-management-questions)
6. [Biomechanics & Domain Questions](#biomechanics--domain-questions)
7. [Performance & Optimization Questions](#performance--optimization-questions)
8. [Testing & Quality Questions](#testing--quality-questions)
9. [System Design Questions](#system-design-questions)
10. [Behavioral Questions](#behavioral-questions)

---

## 🎯 Project Overview Questions

### Q1: Can you describe the ShoulderSim AI project?

**Answer:** ShoulderSim AI is an AI-powered biomechanical shoulder simulation platform designed for pre-operative surgical planning. It allows surgeons to:
- Upload and process DICOM/CT scans
- Visualize patient-specific 3D shoulder anatomy
- Test different implant configurations
- Simulate range of motion and biomechanics
- Generate surgical reports
- Track patient outcomes

The application is built with React, TypeScript, Three.js for 3D visualization, and uses procedural geometry to generate shoulder models without requiring external 3D assets.

### Q2: What problem does this project solve?

**Answer:** The project addresses several key challenges in orthopedic surgery:
- **Pre-operative Planning:** Surgeons can plan implant positioning before surgery
- **Risk Reduction:** Simulate outcomes to identify potential issues
- **Education:** Train residents on surgical techniques
- **Patient Communication:** Visualize procedures for patients
- **Outcome Prediction:** Use AI to predict surgical success rates

Current surgical planning often relies on 2D X-rays and surgeon experience. ShoulderSim AI provides 3D, data-driven planning tools.

### Q3: What is your role in this project?

**Answer:** As the developer, I:
- Designed and implemented the entire frontend application
- Created the 3D visualization system using Three.js
- Implemented biomechanical simulation algorithms
- Built the UI components and user interface
- Structured the project for scalability
- Created comprehensive documentation

### Q4: What are the key features of ShoulderSim AI?

**Answer:**
1. **3D Shoulder Visualization** - Procedural 3D models of scapula and humerus
2. **Layer-based Anatomy** - Toggle bones, muscles, tendons, cartilage, nerves, implants
3. **Implant Planning** - Adjust inclination, anteversion, depth, offset
4. **Motion Simulation** - Simulate flexion, extension, abduction, rotation
5. **CT Slice Viewer** - Multi-planar reconstruction (axial, coronal, sagittal)
6. **Stability Analysis** - Calculate implant stability scores
7. **Wear Simulation** - Predict long-term implant wear
8. **Impingement Detection** - Identify bone/soft tissue conflicts
9. **Force Visualization** - Show biomechanical force vectors
10. **Surgical Reports** - Generate PDF reports for OR use

### Q5: What is the tech stack and why did you choose it?

**Answer:**
- **React + TypeScript:** Type-safe component development, large ecosystem
- **Three.js + React Three Fiber:** Declarative 3D rendering, React integration
- **Vite:** Fast build tool, excellent DX
- **Tailwind CSS:** Rapid UI development, consistent design
- **Radix UI:** Accessible headless components
- **Framer Motion:** Smooth animations
- **Recharts:** Data visualization
- **Wouter:** Lightweight routing

**Rationale:** This stack provides modern, performant tools with strong TypeScript support and excellent developer experience.

---

## 🏗️ Technical Architecture Questions

### Q6: How is the project structured?

**Answer:** The project follows a monorepo structure using pnpm workspaces:

```
shouldersim-ai/
├── artifacts/
│   └── shouldersim-ai/      # Main React app
├── lib/                      # Shared libraries
│   ├── api-client-react/
│   ├── api-spec/
│   ├── api-zod/
│   └── db/
├── scripts/                  # Build scripts
└── docs/                     # Documentation
```

The main app uses a standard React structure:
- `src/pages/` - Route components
- `src/components/ui/` - Reusable UI components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions

### Q7: What design patterns did you use?

**Answer:**
1. **Component Composition:** Small, reusable components composed together
2. **Container/Presentational:** Logic separated from UI (partial implementation)
3. **Custom Hooks:** Reusable stateful logic (useTheme, useCounter, use-toast)
4. **Render Props:** Passing render functions to children (not heavily used)
5. **Higher-Order Components:** Not used (modern React prefers hooks)
6. **Strategy Pattern:** Different view modes (3D, CT, VR) with same interface
7. **Observer Pattern:** useFrame hook for 3D animation loop

### Q8: How do you handle routing?

**Answer:** I use Wouter, a lightweight routing library:
- Hash-based or history-based routing
- Simple Switch/Route pattern
- Route guards can be added
- Programmatic navigation via Link component

**Why Wouter over React Router?**
- Smaller bundle size
- Simpler API
- Sufficient for this use case
- Better performance

### Q9: How is the 3D rendering implemented?

**Answer:** Using React Three Fiber (R3F):
- Declarative Three.js in React
- Components map to Three.js objects
- useFrame hook for animation loop
- useRef for direct Three.js access when needed
- Procedural geometry (no external models)

**Example:**
```typescript
<Canvas>
  <ambientLight intensity={0.5} />
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="blue" />
  </mesh>
</Canvas>
```

### Q10: How do you manage state?

**Answer:** Currently using React's built-in useState:
- Local component state for most data
- No global state management (Redux/Zustand) yet
- Props drilling for passing data down
- Context API could be added for global state

**Future improvements:**
- Add Zustand for global state
- Implement React Query for server state
- Use localStorage for persistence

---

## ⚛️ React & Frontend Questions

### Q11: Why did you choose functional components over class components?

**Answer:**
- **Hooks:** Access to useState, useEffect, useContext, etc.
- **Simpler Syntax:** Less boilerplate code
- **Better Performance:** No class instantiation overhead
- **Modern Best Practice:** React team recommends hooks
- **Easier Testing:** Pure functions easier to test
- **Better TypeScript Support:** Generics work better with functions

### Q12: How do you handle side effects?

**Answer:** Using useEffect hook:
```typescript
useEffect(() => {
  // Side effect code
  return () => {
    // Cleanup function
  };
}, [dependencies]);
```

**Examples in project:**
- Dark mode initialization
- Animation intervals
- Canvas drawing updates
- Event listeners

### Q13: How do you optimize performance?

**Answer:**
- **React.memo:** Memoize expensive components (not heavily used yet)
- **useCallback:** Memoize event handlers (could add)
- **useMemo:** Memoize expensive calculations (could add)
- **Code Splitting:** Lazy load routes (not implemented)
- **3D Optimization:** Reduce geometry segments, disable shadows
- **Bundle Analysis:** Monitor bundle size

### Q14: How do you handle forms?

**Answer:** Using React Hook Form:
- Better performance than controlled inputs
- Built-in validation
- Easy integration with Zod
- Less re-renders

**Example:**
```typescript
const { register, handleSubmit } = useForm();
<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register("name")} />
</form>
```

### Q15: How do you handle TypeScript errors?

**Answer:**
- Strict TypeScript configuration
- Interface definitions for all props
- Type assertions only when necessary
- Generic types for reusable components
- Type guards for runtime checks

**Example:**
```typescript
interface PlanningValues {
  angle: number;
  anteversion: number;
  depth: number;
  offset: number;
}
```

---

## 🎨 3D Graphics & Three.js Questions

### Q16: How does the 3D shoulder model work?

**Answer:** The shoulder model uses procedural geometry:
- **Scapula:** Box geometry for body, cylinder for neck
- **Humerus:** Cylinder for shaft, sphere for head
- **Implant:** Sphere/cylinder combinations
- **Soft Tissue:** Line components for muscles/tendons

**Why procedural?**
- No external 3D assets needed
- Smaller bundle size
- Dynamic parameter adjustment
- Easier to maintain

### Q17: How do you animate the 3D model?

**Answer:** Using useFrame hook from React Three Fiber:
```typescript
useFrame((state) => {
  const time = state.clock.getElapsedTime();
  // Update rotation based on time
  meshRef.current.rotation.y = time * 0.5;
});
```

**Applications:**
- Real-time motion simulation
- Automatic animation mode
- Smooth transitions

### Q18: How do you handle 3D interactions?

**Answer:** Currently limited but could add:
- **OrbitControls:** Camera rotation/zoom (via @react-three/drei)
- **Raycasting:** Click detection on 3D objects
- **Drag Controls:** Move objects in 3D space
- **Gesture Controls:** Touch interactions

### Q19: How do you optimize 3D performance?

**Answer:**
- **Reduce Geometry:** Lower segment counts
- **Instancing:** Reuse geometries when possible
- **LOD:** Level of detail based on distance
- **Frustum Culling:** Three.js automatic
- **Dispose:** Clean up unused resources
- **Web Workers:** Offload calculations (future)

### Q20: How does the CT slice viewer work?

**Answer:** Canvas-based 2D rendering:
- Three orthogonal views (axial, coronal, sagittal)
- HTML5 Canvas API for drawing
- Dynamic geometry based on planning parameters
- Slice depth simulation
- Implant overlay

**Why Canvas over Three.js for 2D?**
- Simpler for 2D drawing
- Better performance for 2D
- Easier to implement medical imaging style

---

## 📊 State Management Questions

### Q21: How do you manage component state?

**Answer:** Using React useState:
```typescript
const [planning, setPlanning] = useState<PlanningValues>({
  angle: 135,
  anteversion: 20,
  depth: 28,
  offset: 0,
});
```

**Immutable updates:**
```typescript
setPlanning(prev => ({ ...prev, angle: newValue }));
```

### Q22: When would you use Redux or Zustand?

**Answer:** I would add global state management when:
- Multiple components need same state
- Complex state logic
- Time-travel debugging needed
- Server state synchronization

**Current state is simple enough for useState, but could add Zustand for:**
- User authentication
- Global settings
- Patient data cache
- Offline sync

### Q23: How do you handle server state?

**Answer:** Currently using mock data. Would use React Query for:
- Caching API responses
- Automatic refetching
- Optimistic updates
- Loading/error states

**Example:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['patients'],
  queryFn: fetchPatients,
});
```

### Q24: How do you handle form state?

**Answer:** Using React Hook Form:
- Uncontrolled inputs (better performance)
- Built-in validation
- Easy submission handling
- Integration with Zod schemas

### Q25: How do you persist state?

**Answer:** Not currently implemented. Would add:
- **localStorage:** User preferences, recent cases
- **IndexedDB:** Large datasets, offline support
- **SessionStorage:** Temporary session data
- **Backend API:** Persistent data storage

---

## 🔬 Biomechanics & Domain Questions

### Q26: What are the key biomechanical parameters?

**Answer:**
1. **Inclination Angle:** Glenoid tilt relative to scapula (optimal: 135°)
2. **Anteversion:** Forward/backward tilt (optimal: 20°)
3. **Depth:** Implant seating depth (optimal: 28mm)
4. **Offset:** Lateral/medial position (optimal: 0mm)
5. **Range of Motion:** Flexion, extension, abduction, rotation

### Q27: How do you calculate implant stability?

**Answer:** Using deviation from optimal values:
```typescript
const deviation = Math.abs(angle - 135) + Math.abs(anteversion - 20);
const stabilityScore = Math.max(0, 100 - deviation * 2);
```

**Logic:**
- Sum absolute deviations from optimal
- Apply penalty factor (×2)
- Subtract from perfect score (100)
- Ensure non-negative

### Q28: How do you detect impingement?

**Answer:** Threshold-based detection:
```typescript
const isImpingement = abduction < 20 || flexion > 135;
```

**Types:**
- **Subacromial:** Abduction < 20° (arm too close to body)
- **Anterior:** Flexion > 135° (arm too far forward)

### Q29: How do you simulate wear?

**Answer:** Time-based simulation:
```typescript
const wearFactor = (depth / 40) + (Math.abs(offset) / 20);
const wearLevel = Math.min(100, progress * wearFactor);
```

**Factors:**
- Deeper implants wear faster
- Higher offset increases wear
- Time progression (0-100%)

### Q30: What are the limitations of the current model?

**Answer:**
- **Simplified Geometry:** Procedural models not patient-specific
- **Approximate Biomechanics:** Simplified force calculations
- **No Soft Tissue Physics:** Muscles/tendons are visual only
- **Limited Validation:** Not clinically validated
- **No AI Integration:** Mock AI predictions
- **No Real DICOM:** Simulated CT data

**Future improvements:**
- Patient-specific CT reconstruction
- Finite element analysis
- Machine learning predictions
- Clinical validation studies

---

## ⚡ Performance & Optimization Questions

### Q31: How do you optimize bundle size?

**Answer:**
- **Tree Shaking:** Remove unused code (Vite automatic)
- **Code Splitting:** Lazy load routes
- **Dynamic Imports:** Load heavy libraries on demand
- **Bundle Analysis:** Monitor with rollup-plugin-visualizer
- **External Assets:** CDN for large libraries

### Q32: How do you optimize rendering performance?

**Answer:**
- **React.memo:** Prevent unnecessary re-renders
- **useMemo:** Cache expensive calculations
- **useCallback:** Stable function references
- **Virtualization:** For long lists (not needed yet)
- **Debouncing:** For frequent updates

### Q33: How do you optimize 3D rendering?

**Answer:**
- **Reduce Geometry:** Lower segment counts
- **Merge Geometries:** Combine when possible
- **Instancing:** Reuse geometries
- **LOD:** Level of detail based on distance
- **Disable Shadows:** When not needed
- **Web Workers:** Offload calculations

### Q34: How do you measure performance?

**Answer:**
- **React DevTools:** Profile component renders
- **Lighthouse:** Web performance audit
- **Chrome DevTools:** Performance tab
- **Three.js Stats:** FPS monitor
- **Bundle Size:** Monitor with vite-bundle-visualizer

### Q35: What are your performance bottlenecks?

**Answer:**
- **Large Component Files:** Some pages >1000 lines
- **No Code Splitting:** All code loaded upfront
- **3D Rendering:** Could be heavy on low-end devices
- **No Memoization:** Some unnecessary re-renders
- **Large Dependencies:** Three.js, Radix UI

**Solutions:**
- Split large components
- Implement lazy loading
- Add React.memo
- Optimize 3D geometry
- Tree-shake unused dependencies

---

## 🧪 Testing & Quality Questions

### Q36: How do you test the application?

**Answer:** Currently no tests implemented. Would add:
- **Unit Tests:** Jest for utility functions
- **Component Tests:** React Testing Library
- **E2E Tests:** Playwright or Cypress
- **Visual Regression:** Chromatic or Percy
- **3D Testing:** Custom Three.js tests

### Q37: How do you ensure code quality?

**Answer:**
- **TypeScript:** Static type checking
- **ESLint:** Linting rules
- **Prettier:** Code formatting
- **Code Review:** Peer review process
- **CI/CD:** Automated testing pipeline

### Q38: How do you handle errors?

**Answer:**
- **Try-Catch:** For async operations
- **Error Boundaries:** React error boundaries
- **Toast Notifications:** User feedback
- **Logging:** Console/error tracking
- **Graceful Degradation:** Fallback UI

### Q39: How do you handle accessibility?

**Answer:**
- **Semantic HTML:** Proper element usage
- **ARIA Labels:** Screen reader support
- **Keyboard Navigation:** Full keyboard access
- **Focus Management:** Proper focus handling
- **Color Contrast:** WCAG compliance
- **Radix UI:** Built-in accessibility

### Q40: How do you handle cross-browser compatibility?

**Answer:**
- **Modern Browsers:** Target last 2 versions
- **Polyfills:** Only if needed
- **Feature Detection:** Check before using
- **Testing:** Test on multiple browsers
- **Browserslist:** Configure target browsers

---

## 🏛️ System Design Questions

### Q41: How would you scale this application?

**Answer:**
- **Frontend:** Code splitting, CDN, caching
- **Backend:** Microservices, load balancing
- **Database:** Sharding, replication
- **3D Rendering:** Server-side rendering, WebGPU
- **AI:** GPU acceleration, model optimization

### Q42: How would you add real user authentication?

**Answer:**
- **Auth Provider:** Auth0, Firebase Auth, or custom
- **JWT Tokens:** Secure session management
- **OAuth:** Social login integration
- **Role-Based Access:** Surgeon, admin, viewer roles
- **HIPAA Compliance:** Secure data handling

### Q43: How would you implement real DICOM processing?

**Answer:**
- **Backend:** Python with pydicom, SimpleITK
- **AI Segmentation:** PyTorch/TensorFlow models
- **3D Reconstruction:** Marching cubes algorithm
- **API:** REST endpoints for upload/processing
- **Storage:** Secure cloud storage (HIPAA compliant)

### Q44: How would you add AI predictions?

**Answer:**
- **Model Training:** Python with historical data
- **Model Serving:** TensorFlow Serving or ONNX Runtime
- **API Integration:** REST or gRPC
- **Caching:** Cache predictions for performance
- **Explainability:** SHAP values for model interpretation

### Q45: How would you handle offline functionality?

**Answer:**
- **Service Worker:** Cache static assets
- **IndexedDB:** Store patient data locally
- **Sync Queue:** Queue changes for later sync
- **Conflict Resolution:** Handle merge conflicts
- **Progressive Web App:** PWA features

---

## 💬 Behavioral Questions

### Q46: Tell me about a challenging technical problem you solved.

**Answer:** Implementing the 3D shoulder model with procedural geometry was challenging. I had to:
- Research shoulder anatomy
- Understand biomechanics
- Create realistic geometry from primitives
- Implement proper rotations and positioning
- Balance realism with performance

**Solution:** Used Three.js primitives with careful positioning and rotation based on anatomical references. Iterated on the model until it looked realistic and moved correctly.

### Q47: How do you handle disagreements with team members?

**Answer:**
- **Listen First:** Understand their perspective
- **Data-Driven:** Use evidence to support decisions
- **Compromise:** Find middle ground when possible
- **Prototype:** Build proof of concept
- **Decide:** Move forward once decision made

### Q48: How do you stay updated with technology?

**Answer:**
- **Documentation:** Read official docs
- **Blogs:** Follow tech blogs and newsletters
- **Conferences:** Attend when possible
- **Open Source:** Contribute to projects
- **Practice:** Build side projects

### Q49: How do you prioritize tasks?

**Answer:**
- **Impact:** Focus on high-impact features
- **Urgency:** Consider deadlines
- **Dependencies:** Handle blocking items first
- **Effort:** Quick wins vs. big projects
- **Communication:** Align with stakeholders

### Q50: What are your career goals?

**Answer:**
- **Short-term:** Master current stack, deliver quality code
- **Medium-term:** Lead projects, mentor others
- **Long-term:** Architecture, technical leadership
- **Continuous Learning:** Always improving skills

---

## 🎯 Additional Technical Deep-Dives

### Q51: Explain the stress level calculation algorithm.

**Answer:**
```typescript
const angleDelta = Math.abs(planning.angle - 135) / 45;
const anteDelta = Math.abs(planning.anteversion - 20) / 20;
const stressLevel = Math.min((angleDelta + anteDelta) / 2, 1);
```

**Step-by-step:**
1. Calculate deviation from optimal inclination (135°)
2. Normalize by 45° (max acceptable deviation)
3. Calculate deviation from optimal anteversion (20°)
4. Normalize by 20° (max acceptable deviation)
5. Average the two normalized deviations
6. Cap at 1.0 (100% stress)

**Result:** 0.0 (low stress) to 1.0 (high stress)

### Q52: How does the useFrame hook work?

**Answer:** useFrame is a React Three Fiber hook that:
- Runs on every animation frame
- Provides access to Three.js state
- Receives delta time between frames
- Can be used for animations and updates

**Example:**
```typescript
useFrame((state, delta) => {
  // state.clock.getElapsedTime() - total time
  // delta - time since last frame
  meshRef.current.rotation.x += delta;
});
```

### Q53: Why use procedural geometry instead of 3D models?

**Answer:**
- **No External Assets:** Smaller bundle size
- **Dynamic:** Can adjust based on parameters
- **Maintainable:** Code-based, easier to version
- **Performance:** Can optimize geometry
- **Flexibility:** Easy to modify

**Trade-offs:**
- Less realistic than scanned models
- More complex to implement
- Limited anatomical accuracy

### Q54: How do you handle responsive design?

**Answer:**
- **Tailwind:** Responsive utilities (sm:, md:, lg:)
- **CSS Grid/Flexbox:** Flexible layouts
- **Viewport Units:** vw, vh for sizing
- **Media Queries:** Custom breakpoints
- **Mobile-First:** Design for mobile first

### Q55: How do you handle dark mode?

**Answer:**
- **CSS Variables:** Theme-aware colors
- **Tailwind dark:** Dark mode utilities
- **Class Toggle:** Add/remove 'dark' class on html
- **System Preference:** Respect user preference
- **Persistence:** Save user choice

---

## 🚀 Advanced Topics

### Q56: How would you add WebXR/VR support?

**Answer:**
- **@react-three/xr:** XR integration for R3F
- **VR Controllers:** Hand tracking support
- **Stereo Rendering:** Side-by-side views
- **Performance:** Optimize for VR frame rates
- **UI:** 3D UI elements in VR space

### Q57: How would you add collaborative features?

**Answer:**
- **WebSockets:** Real-time communication
- **Operational Transformation:** Conflict resolution
- **Presence:** Show active users
- **Cursors:** Show other users' cursors
- **Locking:** Prevent concurrent edits

### Q58: How would you add AI-powered recommendations?

**Answer:**
- **Machine Learning:** Train on historical data
- **Feature Engineering:** Extract relevant features
- **Model Serving:** Deploy as API
- **Explainability:** Show why recommendations made
- **Feedback Loop:** Learn from outcomes

### Q59: How would you handle large DICOM datasets?

**Answer:**
- **Streaming:** Load slices progressively
- **Compression:** Use efficient compression
- **Caching:** Cache processed data
- **CDN:** Distribute globally
- **Lazy Loading:** Load on demand

### Q60: How would you ensure HIPAA compliance?

**Answer:**
- **Encryption:** Data at rest and in transit
- **Access Control:** Role-based permissions
- **Audit Logging:** Track all access
- **Business Associate Agreements:** With vendors
- **Risk Assessment:** Regular security reviews
- **Training:** Staff training on HIPAA

---

## 📝 Quick Reference

### Key Files to Know

- `src/App.tsx` - Routing and providers
- `src/pages/SimulationPage.tsx` - Main simulation (1312 lines)
- `src/pages/DashboardPage.tsx` - Dashboard (448 lines)
- `src/pages/Home.tsx` - Landing page (1926 lines)
- `src/components/ui/` - Reusable components (55 files)

### Key Functions to Explain

- `StabilityTab` - Stability calculation
- `WearSimulationTab` - Wear simulation
- `ImpingementIndicator` - Collision detection
- `ForceVectors` - Force visualization
- `ScapulaMesh` - 3D scapula rendering
- `HumerusMesh` - 3D humerus rendering
- `CtSliceViewer` - 2D CT rendering

### Key Algorithms

1. **Stability Score:** `100 - (|angle-135| + |anteversion-20|) * 2`
2. **Stress Level:** `min((|angle-135|/45 + |anteversion-20|/20) / 2, 1)`
3. **Wear Factor:** `(depth/40) + (|offset|/20)`
4. **Impingement:** `abduction < 20 || flexion > 135`
5. **Joint Force:** `max(0.3, 0.8 + sin(abduction) * 0.8)`

### Key Technologies

- **React 18** - UI framework
- **TypeScript 5.9** - Type safety
- **Three.js** - 3D rendering
- **React Three Fiber** - React integration
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Components
- **Framer Motion** - Animations

---

## 💡 Tips for Interview Success

1. **Know Your Code:** Be able to explain any part of the codebase
2. **Be Honest:** Admit what you don't know
3. **Show Trade-offs:** Explain why you made certain choices
4. **Think Out Loud:** verbalize your thought process
5. **Ask Questions:** Clarify requirements
6. **Be Enthusiastic:** Show passion for the project
7. **Prepare Examples:** Have specific examples ready
8. **Practice:** Rehearse common questions
9. **Stay Calm:** Take time to think
10. **Follow Up:** Ask thoughtful questions at the end

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Biomechanics of the Shoulder](https://www.ncbi.nlm.nih.gov/)

---

**Good luck with your interview! Remember to be confident, honest, and enthusiastic about your work.**
