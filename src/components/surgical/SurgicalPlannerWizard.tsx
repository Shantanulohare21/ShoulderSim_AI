import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Download, Lock } from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface PatientData {
  id: string;
  deid_hash: string;
  age_band: string;
  sex: string;
  bmi: number;
}

interface ScanData {
  id: string;
  patient_id: string;
  modality: string;
  upload_ts: string;
  status: string;
}

interface ImplantConfig {
  type: string;
  size: string;
  version: string;
  offset: number;
  inclination: number;
}

interface SurgicalPlan {
  patient_id: string;
  scan_id: string;
  implant_config: ImplantConfig;
  position: any;
  notes: string;
}

interface SurgicalPlannerWizardProps {
  onPlanComplete?: (plan: SurgicalPlan) => void;
}

export function SurgicalPlannerWizard({ onPlanComplete }: SurgicalPlannerWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Step data
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [selectedScan, setSelectedScan] = useState<ScanData | null>(null);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [implantConfig, setImplantConfig] = useState<ImplantConfig>({
    type: 'TSA',
    size: '42mm',
    version: 'Standard',
    offset: 0,
    inclination: 135
  });
  const [planNotes, setPlanNotes] = useState('');
  const [planLocked, setPlanLocked] = useState(false);
  
  const steps: WizardStep[] = [
    { id: 'patient', title: 'Patient Selection', description: 'Select patient from EHR', completed: !!selectedPatient },
    { id: 'scan', title: 'Scan Upload', description: 'Upload or select DICOM scan', completed: !!selectedScan },
    { id: 'simulation', title: 'Simulation', description: 'Run biomechanical simulation', completed: !!simulationResults },
    { id: 'ai', title: 'AI Analysis', description: 'Review AI recommendations', completed: !!aiRecommendation },
    { id: 'implant', title: 'Implant Placement', description: 'Configure implant parameters', completed: !!implantConfig },
    { id: 'review', title: 'Review & Lock', description: 'Review and finalize plan', completed: planLocked }
  ];
  
  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selectedPatient;
      case 1: return !!selectedScan;
      case 2: return !!simulationResults;
      case 3: return !!aiRecommendation;
      case 4: return !!implantConfig;
      case 5: return planLocked;
      default: return true;
    }
  };
  
  const handleNext = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleLockPlan = async () => {
    setLoading(true);
    try {
      const plan: SurgicalPlan = {
        patient_id: selectedPatient!.id,
        scan_id: selectedScan!.id,
        implant_config: implantConfig,
        position: { /* 3D position data */ },
        notes: planNotes
      };
      
      const response = await fetch('http://localhost:8000/api/v1/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      
      if (response.ok) {
        setPlanLocked(true);
        if (onPlanComplete) {
          onPlanComplete(plan);
        }
      }
    } catch (error) {
      console.error('Failed to lock plan:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportPDF = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/plans/${selectedScan?.id}/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `surgical-plan-${selectedScan?.id}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Patient</h3>
            <p className="text-gray-600">Choose a patient from the EHR system</p>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500">Patient selection from EHR integration</div>
              <button
                onClick={() => setSelectedPatient({
                  id: 'patient-001',
                  deid_hash: 'abc123',
                  age_band: '60-69',
                  sex: 'M',
                  bmi: 27.5
                })}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Select Demo Patient
              </button>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select DICOM Scan</h3>
            <p className="text-gray-600">Upload or select an existing DICOM scan</p>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500">DICOM scan selection</div>
              <button
                onClick={() => setSelectedScan({
                  id: 'scan-001',
                  patient_id: 'patient-001',
                  modality: 'CT',
                  upload_ts: new Date().toISOString(),
                  status: 'segmented'
                })}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Select Demo Scan
              </button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Run Simulation</h3>
            <p className="text-gray-600">Execute biomechanical simulation</p>
            <button
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setSimulationResults({ rom: { max_abduction: 150 }, stress: { peak: 45 } });
                  setLoading(false);
                }, 2000);
              }}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
            >
              {loading ? 'Running Simulation...' : 'Start Simulation'}
            </button>
            {simulationResults && (
              <div className="bg-green-50 p-4 rounded">
                <Check className="w-5 h-5 text-green-600 inline mr-2" />
                Simulation completed successfully
              </div>
            )}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Recommendations</h3>
            <p className="text-gray-600">Review AI-powered implant recommendations</p>
            <button
              onClick={() => {
                setAiRecommendation({
                  success_probability: 0.85,
                  recommended_implant: 'TSA 42mm',
                  confidence: 'high'
                });
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded"
            >
              Load AI Analysis
            </button>
            {aiRecommendation && (
              <div className="bg-purple-50 p-4 rounded">
                <div className="font-semibold">Success Probability: 85%</div>
                <div className="text-sm text-gray-600">
                  Recommended: {aiRecommendation.recommended_implant}
                </div>
              </div>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Implant Configuration</h3>
            <p className="text-gray-600">Configure implant parameters</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={implantConfig.type}
                  onChange={(e) => setImplantConfig({...implantConfig, type: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="TSA">Total Shoulder Arthroplasty</option>
                  <option value="RSA">Reverse Shoulder Arthroplasty</option>
                  <option value="HEMI">Hemiarthroplasty</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <select
                  value={implantConfig.size}
                  onChange={(e) => setImplantConfig({...implantConfig, size: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="38mm">38mm</option>
                  <option value="42mm">42mm</option>
                  <option value="46mm">46mm</option>
                  <option value="50mm">50mm</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Offset (mm)</label>
                <input
                  type="number"
                  value={implantConfig.offset}
                  onChange={(e) => setImplantConfig({...implantConfig, offset: parseFloat(e.target.value)})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Inclination (°)</label>
                <input
                  type="number"
                  value={implantConfig.inclination}
                  onChange={(e) => setImplantConfig({...implantConfig, inclination: parseFloat(e.target.value)})}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review & Lock Plan</h3>
            <p className="text-gray-600">Review all details and lock the surgical plan</p>
            
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <div><strong>Patient:</strong> {selectedPatient?.id}</div>
              <div><strong>Scan:</strong> {selectedScan?.id}</div>
              <div><strong>Implant:</strong> {implantConfig.type} {implantConfig.size}</div>
              <div><strong>Offset:</strong> {implantConfig.offset}mm</div>
              <div><strong>Inclination:</strong> {implantConfig.inclination}°</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={planNotes}
                onChange={(e) => setPlanNotes(e.target.value)}
                placeholder="Add any additional notes..."
                className="w-full p-2 border rounded h-24"
              />
            </div>
            
            {!planLocked ? (
              <button
                onClick={handleLockPlan}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded font-medium disabled:bg-gray-300"
              >
                {loading ? 'Locking...' : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Lock Surgical Plan
                  </span>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="bg-green-50 p-4 rounded text-green-800 text-center font-medium">
                  <Check className="w-5 h-5 inline mr-2" />
                  Plan Locked Successfully
                </div>
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded font-medium"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Export PDF
                  </span>
                </button>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.completed ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-6 h-6 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="mb-6 min-h-64">
        {renderStep()}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-400"
        >
          <span className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </span>
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || currentStep === steps.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:text-gray-500"
        >
          <span className="flex items-center gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
