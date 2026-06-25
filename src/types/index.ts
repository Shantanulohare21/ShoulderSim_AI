/**
 * Type Definitions for ShoulderSim AI
 * 
 * This file contains all TypeScript interfaces and types used throughout the application.
 * Centralizing types ensures consistency and makes the codebase easier to maintain.
 */

/**
 * Planning parameters for implant positioning
 * These values control how the implant is positioned in the glenoid
 */
export interface PlanningValues {
  /** Inclination angle in degrees (optimal: 135°, range: 90-180) */
  angle: number;
  /** Anteversion angle in degrees (optimal: 20°, range: 0-40) */
  anteversion: number;
  /** Implant depth in millimeters (optimal: 28mm, range: 15-45) */
  depth: number;
  /** Humeral offset in millimeters (optimal: 0mm, range: -20 to +20) */
  offset: number;
}

/**
 * Range of motion parameters for shoulder simulation
 * These values control the simulated movement of the shoulder joint
 */
export interface MotionValues {
  /** Forward elevation in degrees (normal: 150-180) */
  flexion: number;
  /** Backward extension in degrees (normal: 45-60) */
  extension: number;
  /** Lateral elevation in degrees (normal: 150-180) */
  abduction: number;
  /** Internal/external rotation in degrees (normal: -90 to +90) */
  rotation: number;
}

/**
 * Anatomical layer keys for visibility toggling
 * Each layer represents a different tissue type in the shoulder anatomy
 */
export type LayerKey = "bones" | "muscles" | "tendons" | "cartilage" | "implant" | "nerves";

/**
 * Patient information structure
 * Contains demographic and clinical data for a patient
 */
export interface Patient {
  /** Unique patient identifier */
  id: string;
  /** Patient name with age and gender (e.g., "James R., 67M") */
  name: string;
  /** Clinical diagnosis */
  diagnosis: string;
  /** Recommended implant type */
  implant: string;
}

/**
 * Recovery progression data point
 * Tracks patient recovery metrics over time
 */
export interface RecoveryData {
  /** Time point in weeks post-operation */
  week: string;
  /** Range of motion in degrees */
  rom: number;
  /** Pain level on 0-100 scale (lower is better) */
  pain: number;
  /** Strength percentage (0-100) */
  strength: number;
}

/**
 * Saved surgical case information
 * Represents a completed simulation case
 */
export interface SavedCase {
  /** Unique case identifier */
  id: string;
  /** Patient information */
  patient: string;
  /** Diagnosis */
  diagnosis: string;
  /** Implant used */
  implant: string;
  /** AI prediction score (0-100) */
  aiScore: number;
  /** Date of simulation */
  date: string;
  /** Current status of the case */
  status: string;
  /** Tags for categorization */
  tags: string[];
}

/**
 * Monthly analytics data
 * Tracks platform usage metrics
 */
export interface MonthlyData {
  /** Month abbreviation */
  month: string;
  /** Number of simulations performed */
  simulations: number;
  /** Number of actual surgeries */
  surgeries: number;
  /** Number of PDF reports exported */
  exports: number;
}

/**
 * Outcome distribution data
 * Represents surgical outcome categories
 */
export interface OutcomeData {
  /** Outcome category name */
  name: string;
  /** Percentage value */
  value: number;
  /** Fill color for visualization */
  fill: string;
}

/**
 * Complication rate data
 * Tracks post-operative complications
 */
export interface ComplicationData {
  /** Complication type */
  name: string;
  /** Percentage occurrence */
  value: number;
}

/**
 * Team member information
 * Represents a surgical team member
 */
export interface TeamMember {
  /** Full name */
  name: string;
  /** Role/position */
  role: string;
  /** Avatar initials */
  avatar: string;
  /** Online status */
  status: "online" | "away" | "offline";
  /** Number of cases handled */
  cases: number;
}

/**
 * Team note information
 * Represents a collaboration note
 */
export interface TeamNote {
  /** Author name */
  author: string;
  /** Time since posting */
  time: string;
  /** Note content */
  content: string;
  /** Note tags */
  tags: string[];
}

/**
 * View mode options for the simulation viewer
 */
export type ViewMode = "3d" | "ct" | "vr";

/**
 * Props for 3D scapula mesh component
 */
export interface ScapulaMeshProps {
  /** Visible anatomical layers */
  layers: Set<LayerKey>;
  /** Planning parameters */
  planning: PlanningValues;
  /** Stress level (0-1) */
  stressLevel: number;
  /** Whether to show stress heatmap */
  heatmap: boolean;
}

/**
 * Props for 3D humerus mesh component
 */
export interface HumerusMeshProps {
  /** Visible anatomical layers */
  layers: Set<LayerKey>;
  /** Motion parameters */
  motionVals: MotionValues;
  /** Planning parameters */
  planning: PlanningValues;
  /** Whether simulation is running */
  simulationRunning: boolean;
}

/**
 * Props for soft tissue layers component
 */
export interface SoftTissueLayersProps {
  /** Visible anatomical layers */
  layers: Set<LayerKey>;
  /** Motion parameters */
  motionVals: MotionValues;
}

/**
 * Props for impingement indicator component
 */
export interface ImpingementIndicatorProps {
  /** Motion parameters */
  motionVals: MotionValues;
}

/**
 * Props for force vectors component
 */
export interface ForceVectorsProps {
  /** Motion parameters */
  motionVals: MotionValues;
}

/**
 * Props for CT slice viewer component
 */
export interface CtSliceViewerProps {
  /** Current slice index (0-128) */
  sliceIndex: number;
  /** Planning parameters */
  planning: PlanningValues;
  /** Visible anatomical layers */
  layers: Set<LayerKey>;
}

/**
 * Props for stability tab component
 */
export interface StabilityTabProps {
  /** Planning parameters */
  planning: PlanningValues;
}

/**
 * Props for wear simulation tab component
 */
export interface WearSimulationTabProps {
  /** Planning parameters */
  planning: PlanningValues;
}

/**
 * Props for surgical report modal
 */
export interface SurgicalReportModalProps {
  /** Planning parameters */
  planning: PlanningValues;
  /** Motion parameters */
  motionVals: MotionValues;
  /** Selected patient */
  patient: Patient;
  /** Callback when modal is closed */
  onClose: () => void;
}
