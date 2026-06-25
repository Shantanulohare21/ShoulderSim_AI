import React, { useState, useEffect } from 'react';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ROMData {
  angle: number;
  abduction: number;
  flexion: number;
  rotation: number;
}

interface StressData {
  position: number;
  vonMises: number;
  principal1: number;
  principal2: number;
}

interface MuscleData {
  muscle: string;
  activation: number[];
  force: number[];
  time: number[];
}

interface SimulationVisualizationProps {
  simulationId?: string;
  simulationType?: 'rom' | 'fea' | 'muscle-forces';
}

export function SimulationVisualization({
  simulationId,
  simulationType = 'rom'
}: SimulationVisualizationProps) {
  const [loading, setLoading] = useState(false);
  const [romData, setRomData] = useState<ROMData[]>([]);
  const [stressData, setStressData] = useState<StressData[]>([]);
  const [muscleData, setMuscleData] = useState<MuscleData[]>([]);
  const [activeTab, setActiveTab] = useState<'rom' | 'stress' | 'muscle'>('rom');
  
  useEffect(() => {
    if (simulationId) {
      loadSimulationResults(simulationId);
    }
  }, [simulationId]);
  
  const loadSimulationResults = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/simulations/${id}/results`);
      const data = await response.json();
      
      if (data.type === 'rom') {
        setRomData(data.results.rom_data || []);
      } else if (data.type === 'fea') {
        setStressData(data.results.stress_data || []);
      } else if (data.type === 'muscle_forces') {
        setMuscleData(data.results.muscle_data || []);
      }
    } catch (error) {
      console.error('Failed to load simulation results:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // ROM Path Chart
  const romChartData = {
    labels: romData.map(d => d.angle),
    datasets: [
      {
        label: 'Abduction',
        data: romData.map(d => d.abduction),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Flexion',
        data: romData.map(d => d.flexion),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Rotation',
        data: romData.map(d => d.rotation),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  
  // Stress Heatmap Chart
  const stressChartData = {
    labels: stressData.map(d => d.position),
    datasets: [
      {
        label: 'von Mises Stress (MPa)',
        data: stressData.map(d => d.vonMises),
        backgroundColor: stressData.map(d => {
          if (d.vonMises > 100) return 'rgba(239, 68, 68, 0.8)';
          if (d.vonMises > 50) return 'rgba(245, 158, 11, 0.8)';
          return 'rgba(34, 197, 94, 0.8)';
        }),
        borderColor: stressData.map(d => {
          if (d.vonMises > 100) return 'rgb(239, 68, 68)';
          if (d.vonMises > 50) return 'rgb(245, 158, 11)';
          return 'rgb(34, 197, 94)';
        }),
        borderWidth: 1
      }
    ]
  };
  
  // Muscle Activation Chart
  const muscleChartData = {
    labels: muscleData[0]?.time || [],
    datasets: muscleData.map((muscle, index) => ({
      label: muscle.muscle,
      data: muscle.activation,
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
      fill: true,
      tension: 0.4
    }))
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: activeTab === 'rom' ? 'Range of Motion' : 
              activeTab === 'stress' ? 'von Mises Stress Distribution' : 
              'Muscle Activation'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: activeTab === 'rom' ? 'Angle (degrees)' : 
                activeTab === 'stress' ? 'Stress (MPa)' : 
                'Activation (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: activeTab === 'rom' ? 'Movement Angle' : 
                activeTab === 'stress' ? 'Position' : 
                'Time (s)'
        }
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading simulation results...</div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('rom')}
          className={`px-4 py-2 rounded ${
            activeTab === 'rom' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          ROM Path
        </button>
        <button
          onClick={() => setActiveTab('stress')}
          className={`px-4 py-2 rounded ${
            activeTab === 'stress' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Stress Heatmap
        </button>
        <button
          onClick={() => setActiveTab('muscle')}
          className={`px-4 py-2 rounded ${
            activeTab === 'muscle' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Muscle Activation
        </button>
      </div>
      
      {/* Charts */}
      <div className="h-96">
        {activeTab === 'rom' && (
          <Line data={romChartData} options={chartOptions} />
        )}
        {activeTab === 'stress' && (
          <Bar data={stressChartData} options={chartOptions} />
        )}
        {activeTab === 'muscle' && (
          <Line data={muscleChartData} options={chartOptions} />
        )}
      </div>
      
      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {activeTab === 'rom' && (
          <>
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-gray-600">Max Abduction</div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.max(...romData.map(d => d.abduction)).toFixed(1)}°
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-gray-600">Max Flexion</div>
              <div className="text-2xl font-bold text-green-600">
                {Math.max(...romData.map(d => d.flexion)).toFixed(1)}°
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <div className="text-sm text-gray-600">Max Rotation</div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.max(...romData.map(d => d.rotation)).toFixed(1)}°
              </div>
            </div>
          </>
        )}
        {activeTab === 'stress' && (
          <>
            <div className="bg-red-50 p-4 rounded">
              <div className="text-sm text-gray-600">Peak Stress</div>
              <div className="text-2xl font-bold text-red-600">
                {Math.max(...stressData.map(d => d.vonMises)).toFixed(1)} MPa
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-sm text-gray-600">Avg Stress</div>
              <div className="text-2xl font-bold text-yellow-600">
                {(stressData.reduce((sum, d) => sum + d.vonMises, 0) / stressData.length).toFixed(1)} MPa
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-gray-600">Critical Regions</div>
              <div className="text-2xl font-bold text-green-600">
                {stressData.filter(d => d.vonMises > 50).length}
              </div>
            </div>
          </>
        )}
        {activeTab === 'muscle' && (
          <>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-sm text-gray-600">Peak Activation</div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.max(...muscleData.flatMap(m => m.activation)).toFixed(1)}%
              </div>
            </div>
            <div className="bg-pink-50 p-4 rounded">
              <div className="text-sm text-gray-600">Peak Force</div>
              <div className="text-2xl font-bold text-pink-600">
                {Math.max(...muscleData.flatMap(m => m.force)).toFixed(1)} N
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded">
              <div className="text-sm text-gray-600">Active Muscles</div>
              <div className="text-2xl font-bold text-indigo-600">
                {muscleData.length}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
