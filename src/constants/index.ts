/**
 * Constants for ShoulderSim AI
 * 
 * This file contains all constant values used throughout the application.
 * Centralizing constants makes it easier to maintain and update configuration values.
 */

/**
 * Optimal implant planning parameters
 * These values represent the ideal positioning for a standard shoulder implant
 */
export const OPTIMAL_PLANNING = {
  /** Optimal inclination angle in degrees */
  INCLINATION: 135,
  /** Optimal anteversion angle in degrees */
  ANTEVERSION: 20,
  /** Optimal implant depth in millimeters */
  DEPTH: 28,
  /** Optimal humeral offset in millimeters */
  OFFSET: 0,
} as const;

/**
 * Acceptable ranges for implant planning parameters
 * Values outside these ranges may indicate suboptimal implant positioning
 */
export const PLANNING_RANGES = {
  /** Inclination angle range in degrees */
  INCLINATION: { min: 90, max: 180 },
  /** Anteversion angle range in degrees */
  ANTEVERSION: { min: 0, max: 40 },
  /** Implant depth range in millimeters */
  DEPTH: { min: 15, max: 45 },
  /** Humeral offset range in millimeters */
  OFFSET: { min: -20, max: 20 },
} as const;

/**
 * Normal range of motion values for a healthy shoulder
 * Used as reference for comparison with simulated values
 */
export const NORMAL_ROM = {
  /** Normal flexion range in degrees */
  FLEXION: { min: 0, max: 180, typical: 150 },
  /** Normal extension range in degrees */
  EXTENSION: { min: 0, max: 60, typical: 45 },
  /** Normal abduction range in degrees */
  ABDUCTION: { min: 0, max: 180, typical: 150 },
  /** Normal rotation range in degrees */
  ROTATION: { min: -90, max: 90, typical: 0 },
} as const;

/**
 * Impingement detection thresholds
 * Motion values outside these ranges trigger impingement warnings
 */
export const IMPINGEMENT_THRESHOLDS = {
  /** Minimum abduction before subacromial impingement */
  ABDUCTION_MIN: 20,
  /** Maximum flexion before anterior impingement */
  FLEXION_MAX: 135,
} as const;

/**
 * Stress calculation parameters
 * Used to normalize deviations for stress level calculation
 */
export const STRESS_PARAMETERS = {
  /** Maximum acceptable inclination deviation for normalization */
  INCLINATION_MAX_DEVIATION: 45,
  /** Maximum acceptable anteversion deviation for normalization */
  ANTEVERSION_MAX_DEVIATION: 20,
} as const;

/**
 * Stability calculation parameters
 * Used to calculate implant stability score
 */
export const STABILITY_PARAMETERS = {
  /** Penalty factor for deviation from optimal values */
  DEVIATION_PENALTY: 2,
} as const;

/**
 * Wear simulation parameters
 * Used to calculate implant wear over time
 */
export const WEAR_PARAMETERS = {
  /** Maximum depth for normalization */
  DEPTH_MAX: 40,
  /** Maximum offset for normalization */
  OFFSET_MAX: 20,
  /** Simulation progress increment per tick */
  PROGRESS_INCREMENT: 0.5,
  /** Simulation tick interval in milliseconds */
  TICK_INTERVAL: 200,
} as const;

/**
 * Force vector calculation parameters
 * Used to calculate biomechanical force magnitudes
 */
export const FORCE_PARAMETERS = {
  /** Base joint reaction force */
  BASE_FORCE: 0.8,
  /** Abduction influence coefficient */
  ABDUCTION_COEFFICIENT: 0.8,
  /** Minimum force magnitude */
  MIN_FORCE: 0.3,
  /** High load threshold for color change */
  HIGH_LOAD_THRESHOLD: 1.25,
} as const;

/**
 * 3D geometry parameters
 * Dimensions and properties for procedural 3D models
 */
export const GEOMETRY_PARAMETERS = {
  /** Scapula body dimensions */
  SCAPULA_BODY: { width: 1.5, height: 2, depth: 0.15 },
  /** Glenoid neck dimensions */
  GLENOID_NECK: { topRadius: 0.3, bottomRadius: 0.5, height: 0.8, segments: 16 },
  /** Glenoid base dimensions */
  GLENOID_BASE: { radius: 0.45, height: 0.2, segments: 32 },
  /** Cartilage layer dimensions */
  CARTILAGE: { radius: 0.47, height: 0.05, segments: 32 },
  /** Glenosphere dimensions */
  GLENOTOSPHERE: { radius: 0.4, segments: 32, heightSegments: 16 },
  /** Humeral shaft dimensions */
  HUMERAL_SHAFT: { topRadius: 0.35, bottomRadius: 0.28, height: 2.0, segments: 16 },
  /** Humeral head dimensions */
  HUMERAL_HEAD: { radius: 0.48, segments: 32, heightSegments: 16 },
  /** Implant stem dimensions */
  IMPLANT_STEM: { topRadius: 0.15, bottomRadius: 0.08, height: 0.9, segments: 16 },
  /** Humeral cup dimensions */
  HUMERAL_CUP: { topRadius: 0.49, bottomRadius: 0.44, height: 0.15, segments: 32 },
} as const;

/**
 * 3D model positioning
 * Default positions for 3D model components
 */
export const MODEL_POSITIONS = {
  /** Scapula group position */
  SCAPULA: { x: -1.2, y: 0, z: 0 },
  /** Glenoid neck position */
  GLENOID_NECK: { x: 0.8, y: 0.2, z: 0 },
  /** Glenoid base position */
  GLENOID_BASE: { x: 1.1, y: 0.3, z: 0 },
  /** Cartilage position offset */
  CARTILAGE: { x: 0, y: 0.11, z: 0 },
  /** Implant position offset */
  IMPLANT: { x: 0, y: 0.15, z: 0 },
  /** Humerus group position */
  HUMERUS: { x: 0.3, y: -0.3, z: 0 },
  /** Humeral shaft position */
  HUMERAL_SHAFT: { x: 0, y: -1.2, z: 0 },
  /** Humeral head position offset */
  HUMERAL_HEAD: { x: 0, y: -0.1, z: 0 },
  /** Implant stem position offset */
  IMPLANT_STEM: { x: 0, y: -0.4, z: 0 },
  /** Humeral cup position offset */
  HUMERAL_CUP: { x: 0, y: 0.1, z: 0 },
} as const;

/**
 * Material colors
 * RGB color values for different anatomical structures
 */
export const MATERIAL_COLORS = {
  /** Bone color */
  BONE: "#cbd5e1",
  /** Glenoid neck color */
  GLENOID_NECK: "#94a3b8",
  /** Cartilage color */
  CARTILAGE: "#86efac",
  /** Implant color */
  IMPLANT: "#06b6d4",
  /** Implant cup color */
  IMPLANT_CUP: "#0891b2",
  /** Muscle color */
  MUSCLE: "#3b82f6",
  /** Tendon color */
  TENDON: "#fbbf24",
  /** Nerve color 1 */
  NERVE_1: "#faccc9",
  /** Nerve color 2 */
  NERVE_2: "#eab308",
} as const;

/**
 * Stress heatmap colors
 * Colors for different stress levels
 */
export const STRESS_COLORS = {
  /** Low stress color */
  LOW: "#22c55e",
  /** Medium stress color */
  MEDIUM: "#eab308",
  /** High stress color */
  HIGH: "#ef4444",
} as const;

/**
 * CT slice viewer parameters
 * Configuration for 2D CT slice rendering
 */
export const CT_VIEWER_PARAMETERS = {
  /** Canvas width in pixels */
  CANVAS_WIDTH: 160,
  /** Canvas height in pixels */
  CANVAS_HEIGHT: 280,
  /** Total number of slices */
  TOTAL_SLICES: 128,
  /** Center slice index */
  CENTER_SLICE: 64,
  /** Grid line spacing */
  GRID_SPACING: 20,
  /** Background color */
  BACKGROUND: "#0c111d",
  /** Grid line color */
  GRID_COLOR: "rgba(6, 182, 212, 0.15)",
  /** Anatomy line color */
  ANATOMY_COLOR: "rgba(226, 232, 240, 0.75)",
  /** Implant line color */
  IMPLANT_COLOR: "#06b6d4",
} as const;

/**
 * Animation parameters
 * Settings for real-time animations
 */
export const ANIMATION_PARAMETERS = {
  /** Flexion animation frequency */
  FLEXION_FREQUENCY: 2.5,
  /** Flexion animation amplitude */
  FLEXION_AMPLITUDE: 12,
  /** Abduction animation frequency */
  ABDUCTION_FREQUENCY: 2.0,
  /** Abduction animation amplitude */
  ABDUCTION_AMPLITUDE: 10,
} as const;

/**
 * Stereoscopic VR parameters
 * Settings for VR mode rendering
 */
export const VR_PARAMETERS = {
  /** Eye separation distance */
  EYE_SEPARATION: 0.16,
  /** Camera field of view */
  CAMERA_FOV: 45,
  /** Camera position Z */
  CAMERA_Z: 3.2,
  /** Camera position Y */
  CAMERA_Y: 0.5,
} as const;

/**
 * Soft tissue attachment parameters
 * Base positions for muscle/tendon attachments
 */
export const SOFT_TISSUE_ATTACHMENTS = {
  /** Supraspinatus origin */
  SUPRASPINATUS_ORIGIN: { x: -1.2, y: 0.8, z: 0 },
  /** Supraspinatus midpoint */
  SUPRASPINATUS_MID: { x: -0.5, y: 0.6, z: 0.1 },
  /** Infraspinatus origin */
  INFRASPINATUS_ORIGIN: { x: -1.0, y: -0.6, z: 0.4 },
  /** Brachial plexus origin */
  BRACHIAL_PLEXUS_ORIGIN: { x: -1.5, y: 1.2, z: -0.2 },
  /** Brachial plexus midpoint 1 */
  BRACHIAL_PLEXUS_MID_1: { x: -0.8, y: 0.1, z: -0.4 },
  /** Brachial plexus midpoint 2 */
  BRACHIAL_PLEXUS_MID_2: { x: -0.6, y: -0.2, z: 0.2 },
  /** Brachial plexus endpoint 1 */
  BRACHIAL_PLEXUS_END_1: { x: 0.1, y: -1.0, z: -0.3 },
  /** Brachial plexus endpoint 2 */
  BRACHIAL_PLEXUS_END_2: { x: 0.3, y: -1.2, z: 0.1 },
} as const;

/**
 * Line widths for soft tissue visualization
 */
export const LINE_WIDTHS = {
  /** Muscle line width */
  MUSCLE: 4,
  /** Tendon line width */
  TENDON: 2.5,
  /** Nerve line width 1 */
  NERVE_1: 1.5,
  /** Nerve line width 2 */
  NERVE_2: 1.2,
} as const;

/**
 * Force vector parameters
 * Dimensions and positioning for force visualization
 */
export const FORCE_VECTOR_PARAMETERS = {
  /** Joint reaction force position */
  JOINT_FORCE_POSITION: { x: -0.1, y: 0.3, z: 0 },
  /** Joint force base rotation */
  JOINT_FORCE_BASE_ROTATION: -1.1,
  /** Joint force cylinder radius */
  JOINT_FORCE_RADIUS: 0.025,
  /** Joint force cone dimensions */
  JOINT_FORCE_CONE: { radius: 0.07, height: 0.15, segments: 8 },
  /** Deltoid force position */
  DELTOID_FORCE_POSITION: { x: 0.5, y: 0.4, z: 0 },
  /** Deltoid force base rotation */
  DELTOID_FORCE_BASE_ROTATION: 0.3,
  /** Deltoid force cylinder radius */
  DELTOID_FORCE_RADIUS: 0.015,
  /** Deltoid force cylinder height */
  DELTOID_FORCE_CYLINDER_HEIGHT: 0.8,
  /** Deltoid force cone dimensions */
  DELTOID_FORCE_CONE: { radius: 0.05, height: 0.1, segments: 8 },
  /** Deltoid force cone offset */
  DELTOID_FORCE_CONE_OFFSET: 0.04,
} as const;

/**
 * Impingement indicator parameters
 * Settings for collision visualization
 */
export const IMPINGEMENT_INDICATOR_PARAMETERS = {
  /** Sphere radius */
  SPHERE_RADIUS: 0.08,
  /** Sphere segments */
  SPHERE_SEGMENTS: 16,
  /** Outer sphere scale */
  OUTER_SPHERE_SCALE: 1.4,
  /** Subacromial contact position */
  SUBACROMIAL_CONTACT: { x: -0.2, y: 0.05, z: 0.05 },
  /** Anterior contact position */
  ANTERIOR_CONTACT: { x: 0.1, y: 0.25, z: 0.15 },
} as const;

/**
 * Mock patient data
 * Sample patient records for demonstration
 */
export const MOCK_PATIENTS = [
  {
    id: "P-2024-0142",
    name: "James R., 67M",
    diagnosis: "Glenohumeral OA Stage IV",
    implant: "Total Shoulder Arthroplasty",
  },
  {
    id: "P-2024-0138",
    name: "Susan K., 58F",
    diagnosis: "Rotator Cuff Tear + OA",
    implant: "Reverse Total Shoulder",
  },
  {
    id: "P-2024-0129",
    name: "Robert M., 72M",
    diagnosis: "Humeral Head AVN",
    implant: "Humeral Resurfacing",
  },
] as const;

/**
 * Mock recovery data
 * Sample recovery progression for demonstration
 */
export const MOCK_RECOVERY_DATA = [
  { week: "0", rom: 20, pain: 80, strength: 10 },
  { week: "2", rom: 35, pain: 65, strength: 18 },
  { week: "4", rom: 55, pain: 48, strength: 30 },
  { week: "6", rom: 70, pain: 35, strength: 45 },
  { week: "8", rom: 82, pain: 25, strength: 58 },
  { week: "12", rom: 95, pain: 15, strength: 70 },
  { week: "16", rom: 105, pain: 10, strength: 80 },
  { week: "24", rom: 120, pain: 8, strength: 88 },
  { week: "52", rom: 140, pain: 3, strength: 95 },
] as const;
