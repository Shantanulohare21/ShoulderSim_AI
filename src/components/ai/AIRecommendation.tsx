import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, TrendingUp, TrendingDown } from 'lucide-react';

interface SHAPValue {
  feature: string;
  value: number;
  contribution: number;
  direction: 'positive' | 'negative';
}

interface AIPrediction {
  model_name: string;
  model_version: string;
  success_probability: number;
  confidence_interval: [number, number];
  risk_factors: SHAPValue[];
  supporting_evidence_count: number;
  contraindications: string[];
  timestamp: string;
}

interface AIRecommendationProps {
  patientId?: string;
  scanId?: string;
}

export function AIRecommendation({ patientId, scanId }: AIRecommendationProps) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverride, setShowOverride] = useState(false);
  const [overrideSubmitted, setOverrideSubmitted] = useState(false);
  
  useEffect(() => {
    if (scanId) {
      loadAIPrediction(scanId);
    }
  }, [scanId]);
  
  const loadAIPrediction = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/ai/success-predictor/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_id: id })
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Failed to load AI prediction:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOverride = async () => {
    if (!overrideReason.trim()) return;
    
    try {
      await fetch(`http://localhost:8000/api/v1/ai/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          prediction_id: prediction?.model_name,
          reason: overrideReason
        })
      });
      setOverrideSubmitted(true);
      setShowOverride(false);
    } catch (error) {
      console.error('Failed to submit override:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading AI prediction...</div>
        </div>
      </div>
    );
  }
  
  if (!prediction) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          No AI prediction available. Please provide a scan ID.
        </div>
      </div>
    );
  }
  
  const successColor = prediction.success_probability > 0.8 ? 'text-green-600' :
                      prediction.success_probability > 0.6 ? 'text-yellow-600' :
                      'text-red-600';
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          AI Implant Success Prediction
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="w-4 h-4" />
          <span>
            Model: {prediction.model_name} v{prediction.model_version}
          </span>
        </div>
      </div>
      
      {/* Success Probability */}
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-gray-700">
            Success Probability
          </span>
          <span className={`text-3xl font-bold ${successColor}`}>
            {(prediction.success_probability * 100).toFixed(1)}%
          </span>
        </div>
        
        {/* Confidence Interval */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            95% Confidence Interval
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  marginLeft: `${prediction.confidence_interval[0] * 100}%`,
                  width: `${(prediction.confidence_interval[1] - prediction.confidence_interval[0]) * 100}%`
                }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {(prediction.confidence_interval[0] * 100).toFixed(0)}% - {(prediction.confidence_interval[1] * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        
        {/* Supporting Evidence */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>
            Based on {prediction.supporting_evidence_count} similar cases
          </span>
        </div>
      </div>
      
      {/* SHAP Explanations */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Risk Factors (SHAP Values)
        </h3>
        <div className="space-y-3">
          {prediction.risk_factors.map((factor, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
              <div className={`p-2 rounded ${
                factor.direction === 'positive' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {factor.direction === 'positive' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{factor.feature}</div>
                <div className="text-sm text-gray-600">Value: {factor.value.toFixed(2)}</div>
              </div>
              <div className={`text-lg font-bold ${
                factor.direction === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {factor.direction === 'positive' ? '+' : ''}{factor.contribution.toFixed(3)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Contraindications */}
      {prediction.contraindications.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">
              Known Contraindications
            </h3>
          </div>
          <ul className="space-y-2">
            {prediction.contraindications.map((contraindication, index) => (
              <li key={index} className="text-sm text-red-700">
                • {contraindication}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Disclaimer */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Important:</strong> This AI prediction is for decision support only.
            The final decision rests with the surgeon. This recommendation should be
            reviewed in the context of the complete clinical picture.
          </div>
        </div>
      </div>
      
      {/* Override Button */}
      {!overrideSubmitted ? (
        <button
          onClick={() => setShowOverride(true)}
          className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
        >
          Override AI Recommendation
        </button>
      ) : (
        <div className="w-full px-4 py-3 bg-green-100 text-green-800 rounded-lg font-medium text-center">
          Override recorded for review
        </div>
      )}
      
      {/* Override Modal */}
      {showOverride && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Override AI Recommendation
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for overriding this AI recommendation.
              This will be logged for post-market surveillance analysis.
            </p>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Enter reason for override..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 h-32"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowOverride(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOverride}
                disabled={!overrideReason.trim()}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  overrideReason.trim()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
