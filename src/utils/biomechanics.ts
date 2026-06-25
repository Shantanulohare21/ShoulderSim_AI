/**
 * Biomechanical Calculation Utilities
 * 
 * This file contains utility functions for calculating biomechanical metrics
 * such as stress levels, stability scores, wear rates, and force vectors.
 * All calculations are based on established orthopedic biomechanics principles.
 */

import {
  PlanningValues,
  MotionValues,
} from "../types";
import {
  OPTIMAL_PLANNING,
  STRESS_PARAMETERS,
  STABILITY_PARAMETERS,
  WEAR_PARAMETERS,
  FORCE_PARAMETERS,
  IMPINGEMENT_THRESHOLDS,
  STRESS_COLORS,
} from "../constants";

/**
 * Calculate stress level based on implant positioning
 * 
 * This function computes a normalized stress level (0-1) based on how far
 * the implant parameters deviate from optimal values. Higher values indicate
 * higher stress on the implant-bone interface.
 * 
 * @param planning - Implant planning parameters
 * @returns Stress level between 0 (low stress) and 1 (high stress)
 * 
 * @example
 * ```ts
 * const stress = calculateStressLevel({ angle: 135, anteversion: 20, depth: 28, offset: 0 });
 * // Returns: 0 (optimal positioning)
 * ```
 */
export function calculateStressLevel(planning: PlanningValues): number {
  const angleDelta = Math.abs(planning.angle - OPTIMAL_PLANNING.INCLINATION) / STRESS_PARAMETERS.INCLINATION_MAX_DEVIATION;
  const anteDelta = Math.abs(planning.anteversion - OPTIMAL_PLANNING.ANTEVERSION) / STRESS_PARAMETERS.ANTEVERSION_MAX_DEVIATION;
  const stressLevel = Math.min((angleDelta + anteDelta) / 2, 1);
  return stressLevel;
}

/**
 * Get stress color based on stress level
 * 
 * Returns the appropriate color for visualization based on the calculated
 * stress level. Green for low stress, yellow for medium, red for high.
 * 
 * @param stressLevel - Stress level between 0 and 1
 * @returns Hex color code for stress visualization
 */
export function getStressColor(stressLevel: number): string {
  if (stressLevel < 0.3) return STRESS_COLORS.LOW;
  if (stressLevel < 0.6) return STRESS_COLORS.MEDIUM;
  return STRESS_COLORS.HIGH;
}

/**
 * Calculate implant stability score
 * 
 * Computes a stability score (0-100) based on deviation from optimal
 * implant positioning. Higher scores indicate better stability.
 * 
 * @param planning - Implant planning parameters
 * @returns Stability score between 0 and 100
 * 
 * @example
 * ```ts
 * const stability = calculateStabilityScore({ angle: 135, anteversion: 20, depth: 28, offset: 0 });
 * // Returns: 100 (optimal stability)
 * ```
 */
export function calculateStabilityScore(planning: PlanningValues): number {
  const deviation = Math.abs(planning.angle - OPTIMAL_PLANNING.INCLINATION) + 
                    Math.abs(planning.anteversion - OPTIMAL_PLANNING.ANTEVERSION);
  const stabilityScore = Math.max(0, 100 - deviation * STABILITY_PARAMETERS.DEVIATION_PENALTY);
  return stabilityScore;
}

/**
 * Calculate wear factor based on implant parameters
 * 
 * Computes a wear factor that represents how quickly the implant will wear
 * based on depth and offset. Higher values indicate faster wear.
 * 
 * @param planning - Implant planning parameters
 * @returns Wear factor (typically 0.5 - 2.0)
 */
export function calculateWearFactor(planning: PlanningValues): number {
  const wearFactor = (planning.depth / WEAR_PARAMETERS.DEPTH_MAX) + 
                     (Math.abs(planning.offset) / WEAR_PARAMETERS.OFFSET_MAX);
  return wearFactor;
}

/**
 * Calculate wear level at a given time progress
 * 
 * Computes the cumulative wear percentage based on time progress and
 * implant parameters.
 * 
 * @param planning - Implant planning parameters
 * @param progress - Time progress (0-100)
 * @returns Wear level between 0 and 100
 */
export function calculateWearLevel(planning: PlanningValues, progress: number): number {
  const wearFactor = calculateWearFactor(planning);
  const wearLevel = Math.min(100, progress * wearFactor);
  return wearLevel;
}

/**
 * Detect impingement based on motion parameters
 * 
 * Checks if the current motion parameters would cause bone or soft tissue
 * impingement. Returns the type of impingement if detected.
 * 
 * @param motionVals - Range of motion parameters
 * @returns Object indicating if impingement exists and its type
 */
export function detectImpingement(motionVals: MotionValues): {
  isImpingement: boolean;
  type: "subacromial" | "anterior" | "none";
} {
  if (motionVals.abduction < IMPINGEMENT_THRESHOLDS.ABDUCTION_MIN) {
    return { isImpingement: true, type: "subacromial" };
  }
  if (motionVals.flexion > IMPINGEMENT_THRESHOLDS.FLEXION_MAX) {
    return { isImpingement: true, type: "anterior" };
  }
  return { isImpingement: false, type: "none" };
}

/**
 * Calculate joint reaction force magnitude
 * 
 * Computes the magnitude of the joint reaction force based on abduction angle.
 * The force increases with abduction due to increased deltoid leverage.
 * 
 * @param motionVals - Range of motion parameters
 * @returns Force magnitude (typically 0.3 - 1.6)
 */
export function calculateJointReactionForce(motionVals: MotionValues): number {
  const abdRad = (motionVals.abduction * Math.PI) / 180;
  const jointForceMag = Math.max(
    FORCE_PARAMETERS.MIN_FORCE,
    FORCE_PARAMETERS.BASE_FORCE + Math.sin(abdRad) * FORCE_PARAMETERS.ABDUCTION_COEFFICIENT
  );
  return jointForceMag;
}

/**
 * Check if force magnitude is high
 * 
 * Determines if the current force magnitude exceeds the high load threshold.
 * 
 * @param forceMagnitude - Calculated force magnitude
 * @returns True if force is considered high load
 */
export function isHighLoad(forceMagnitude: number): boolean {
  return forceMagnitude > FORCE_PARAMETERS.HIGH_LOAD_THRESHOLD;
}

/**
 * Convert degrees to radians
 * 
 * Utility function for angle conversion needed in 3D rotations.
 * 
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate inclination rotation for 3D model
 * 
 * Computes the rotation angle for the glenoid component based on
 * the inclination planning parameter.
 * 
 * @param planning - Implant planning parameters
 * @returns Rotation in radians
 */
export function calculateInclinationRotation(planning: PlanningValues): number {
  return degreesToRadians(planning.angle - OPTIMAL_PLANNING.INCLINATION);
}

/**
 * Calculate anteversion rotation for 3D model
 * 
 * Computes the rotation angle for the glenoid component based on
 * the anteversion planning parameter.
 * 
 * @param planning - Implant planning parameters
 * @returns Rotation in radians
 */
export function calculateAnteversionRotation(planning: PlanningValues): number {
  return degreesToRadians(planning.anteversion - OPTIMAL_PLANNING.ANTEVERSION);
}

/**
 * Calculate humeral offset for 3D model
 * 
 * Computes the lateral/medial offset for the humeral component.
 * Scaled down for 3D model coordinates.
 * 
 * @param planning - Implant planning parameters
 * @returns Offset in 3D model units
 */
export function calculateHumeralOffset(planning: PlanningValues): number {
  return planning.offset / 10;
}

/**
 * Calculate 3D rotation angles from motion parameters
 * 
 * Computes the X, Y, Z rotation angles for the humerus based on
 * flexion, extension, abduction, and rotation parameters.
 * 
 * @param motionVals - Range of motion parameters
 * @returns Object with rotation angles in radians
 */
export function calculateMotionRotations(motionVals: MotionValues): {
  rotX: number;
  rotY: number;
  rotZ: number;
} {
  const rotX = degreesToRadians(motionVals.flexion);
  const rotY = degreesToRadians(motionVals.rotation);
  const rotZ = degreesToRadians(motionVals.abduction - motionVals.extension);
  return { rotX, rotY, rotZ };
}

/**
 * Calculate dynamic soft tissue attachment points
 * 
 * Computes the attachment points for muscles and tendons based on
 * current motion parameters. These points move dynamically as the
 * shoulder rotates.
 * 
 * @param motionVals - Range of motion parameters
 * @returns Object with attachment point coordinates
 */
export function calculateSoftTissueAttachments(motionVals: MotionValues): {
  humAttachY: number;
  humAttachX: number;
  humAttachZ: number;
} {
  const abdRad = degreesToRadians(motionVals.abduction);
  const flexRad = degreesToRadians(motionVals.flexion);

  const humAttachY = -0.3 - Math.sin(abdRad) * 0.5;
  const humAttachX = 0.3 + Math.cos(abdRad) * 0.4;
  const humAttachZ = Math.sin(flexRad) * 0.3;

  return { humAttachY, humAttachX, humAttachZ };
}

/**
 * Calculate depth scale for CT slice visualization
 * 
 * Computes a scaling factor based on slice depth to simulate
 * the appearance of different slice levels in CT imaging.
 * 
 * @param sliceIndex - Current slice index (0-128)
 * @returns Scale factor (0.2 - 1.0)
 */
export function calculateDepthScale(sliceIndex: number): number {
  return Math.max(0.2, 1.0 - Math.abs(sliceIndex - 64) / 100);
}

/**
 * Validate planning parameters
 * 
 * Checks if planning parameters are within acceptable ranges.
 * 
 * @param planning - Implant planning parameters
 * @returns Object with validation result and errors
 */
export function validatePlanningParameters(planning: PlanningValues): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (planning.angle < 90 || planning.angle > 180) {
    errors.push("Inclination must be between 90° and 180°");
  }
  if (planning.anteversion < 0 || planning.anteversion > 40) {
    errors.push("Anteversion must be between 0° and 40°");
  }
  if (planning.depth < 15 || planning.depth > 45) {
    errors.push("Depth must be between 15mm and 45mm");
  }
  if (planning.offset < -20 || planning.offset > 20) {
    errors.push("Offset must be between -20mm and +20mm");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate motion parameters
 * 
 * Checks if motion parameters are within physiological ranges.
 * 
 * @param motionVals - Range of motion parameters
 * @returns Object with validation result and errors
 */
export function validateMotionParameters(motionVals: MotionValues): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (motionVals.flexion < 0 || motionVals.flexion > 180) {
    errors.push("Flexion must be between 0° and 180°");
  }
  if (motionVals.extension < 0 || motionVals.extension > 60) {
    errors.push("Extension must be between 0° and 60°");
  }
  if (motionVals.abduction < 0 || motionVals.abduction > 180) {
    errors.push("Abduction must be between 0° and 180°");
  }
  if (motionVals.rotation < -90 || motionVals.rotation > 90) {
    errors.push("Rotation must be between -90° and +90°");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
