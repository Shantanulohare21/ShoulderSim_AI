import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Line } from '@react-three/drei';
import * as THREE from 'three';

interface MeshLayer {
  id: string;
  name: string;
  tissueType: string;
  visible: boolean;
  opacity: number;
  color: string;
  meshData?: any;
}

interface Viewer3DProps {
  scanId?: string;
  meshes?: MeshLayer[];
  onMeshToggle?: (meshId: string, visible: boolean) => void;
  onOpacityChange?: (meshId: string, opacity: number) => void;
  enableMeasurement?: boolean;
  enableExport?: boolean;
}

// Individual mesh component
function MeshLayerComponent({ layer }: { layer: MeshLayer }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  if (!layer.visible || !layer.meshData) return null;
  
  return (
    <mesh ref={meshRef}>
      <primitive object={layer.meshData} />
      <meshStandardMaterial
        color={layer.color}
        transparent={true}
        opacity={layer.opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Measurement tool component
function MeasurementTool({ enabled }: { enabled: boolean }) {
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  const { camera, scene } = useThree();
  
  useEffect(() => {
    if (!enabled) {
      setPoints([]);
      return;
    }
    
    const handleClick = (event: MouseEvent) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      
      if (intersects.length > 0) {
        const newPoint = intersects[0].point;
        setPoints(prev => [...prev, newPoint]);
      }
    };
    
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [enabled, camera, scene]);
  
  if (points.length < 2) return null;
  
  return (
    <Line
      points={points}
      color="#00ff00"
      lineWidth={2}
    />
  );
}

// Main 3D Viewer component
export function Viewer3D({
  scanId,
  meshes = [],
  onMeshToggle,
  onOpacityChange,
  enableMeasurement = false,
  enableExport = false
}: Viewer3DProps) {
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<number | null>(null);
  
  // Load mesh data from backend
  useEffect(() => {
    if (scanId) {
      loadMeshesFromBackend(scanId);
    }
  }, [scanId]);
  
  const loadMeshesFromBackend = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/scans/${id}/meshes`);
      const data = await response.json();
      // Process and load mesh data
      console.log('Loaded meshes:', data);
    } catch (error) {
      console.error('Failed to load meshes:', error);
    }
  };
  
  const handleMeshToggle = (meshId: string) => {
    const mesh = meshes.find(m => m.id === meshId);
    if (mesh && onMeshToggle) {
      onMeshToggle(meshId, !mesh.visible);
    }
  };
  
  const handleOpacityChange = (meshId: string, opacity: number) => {
    if (onOpacityChange) {
      onOpacityChange(meshId, opacity);
    }
  };
  
  const handleExportMesh = async (meshId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/scans/${scanId}/meshes/${meshId}`);
      const data = await response.json();
      
      // Download STL file
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = `${meshId}.stl`;
      link.click();
    } catch (error) {
      console.error('Failed to export mesh:', error);
    }
  };
  
  return (
    <div className="relative w-full h-full">
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10 max-w-xs">
        <h3 className="font-semibold mb-3 text-sm">Anatomy Layers</h3>
        {meshes.map((layer) => (
          <div key={layer.id} className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={layer.visible}
              onChange={() => handleMeshToggle(layer.id)}
              className="w-4 h-4"
            />
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: layer.color }}
            />
            <span className="text-sm flex-1">{layer.name}</span>
            {layer.visible && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={layer.opacity}
                onChange={(e) => handleOpacityChange(layer.id, parseFloat(e.target.value))}
                className="w-16"
              />
            )}
            {enableExport && (
              <button
                onClick={() => handleExportMesh(layer.id)}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
              >
                Export
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Measurement Controls */}
      {enableMeasurement && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10">
          <button
            onClick={() => setMeasurementMode(!measurementMode)}
            className={`px-4 py-2 rounded text-sm ${
              measurementMode ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {measurementMode ? 'Exit Measurement' : 'Measure Distance'}
          </button>
          {measurementResult !== null && (
            <div className="mt-2 text-sm">
              Distance: {measurementResult.toFixed(2)} mm
            </div>
          )}
        </div>
      )}
      
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <OrbitControls enableDamping dampingFactor={0.05} />
        
        {meshes.map((layer) => (
          <MeshLayerComponent key={layer.id} layer={layer} />
        ))}
        
        {measurementMode && <MeasurementTool enabled={measurementMode} />}
        
        <gridHelper args={[10, 10]} />
        <axesHelper args={[5, 5, 5]} />
      </Canvas>
    </div>
  );
}

// Default mesh layers for shoulder anatomy
export const defaultShoulderLayers: MeshLayer[] = [
  {
    id: 'humerus',
    name: 'Humerus',
    tissueType: 'humerus',
    visible: true,
    opacity: 0.9,
    color: '#e8e8e8'
  },
  {
    id: 'scapula',
    name: 'Scapula',
    tissueType: 'scapula',
    visible: true,
    opacity: 0.9,
    color: '#d4d4d4'
  },
  {
    id: 'clavicle',
    name: 'Clavicle',
    tissueType: 'clavicle',
    visible: true,
    opacity: 0.9,
    color: '#c8c8c8'
  },
  {
    id: 'cartilage',
    name: 'Articular Cartilage',
    tissueType: 'cartilage',
    visible: true,
    opacity: 0.7,
    color: '#87ceeb'
  },
  {
    id: 'supraspinatus',
    name: 'Supraspinatus',
    tissueType: 'supraspinatus',
    visible: true,
    opacity: 0.6,
    color: '#ff6b6b'
  },
  {
    id: 'infraspinatus',
    name: 'Infraspinatus',
    tissueType: 'infraspinatus',
    visible: true,
    opacity: 0.6,
    color: '#ffa07a'
  },
  {
    id: 'subscapularis',
    name: 'Subscapularis',
    tissueType: 'subscapularis',
    visible: true,
    opacity: 0.6,
    color: '#ff7f50'
  },
  {
    id: 'teres_minor',
    name: 'Teres Minor',
    tissueType: 'teres_minor',
    visible: true,
    opacity: 0.6,
    color: '#ff6347'
  },
  {
    id: 'deltoid',
    name: 'Deltoid',
    tissueType: 'deltoid',
    visible: true,
    opacity: 0.5,
    color: '#9370db'
  }
];
