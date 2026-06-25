import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, VRButton, XR, Controllers, Hands } from '@react-three/xr';
import * as THREE from 'three';

interface WebXRViewerProps {
  patientModel?: any;
  implantModel?: any;
  enableHandTracking?: boolean;
  enableSpatialAnchoring?: boolean;
}

// Patient model component
function PatientModel({ model }: { model?: any }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle rotation for better viewing
      meshRef.current.rotation.y += 0.001;
    }
  });
  
  if (!model) {
    // Fallback procedural model
    return (
      <group ref={meshRef}>
        {/* Humerus */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.3, 32]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>
        {/* Scapula */}
        <mesh position={[0.1, 0.15, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.15, 0.12, 0.02]} />
          <meshStandardMaterial color="#d4d4d4" />
        </mesh>
        {/* Clavicle */}
        <mesh position={[0.2, 0.25, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <cylinderGeometry args={[0.02, 0.02, 0.15, 16]} />
          <meshStandardMaterial color="#c8c8c8" />
        </mesh>
      </group>
    );
  }
  
  return <primitive object={model} />;
}

// Implant model component
function ImplantModel({ model, position }: { model?: any; position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  if (!model) {
    // Fallback procedural implant
    return (
      <mesh
        ref={meshRef}
        position={position || [0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.04, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? '#3b82f6' : '#60a5fa'}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    );
  }
  
  return <primitive object={model} position={position} />;
}

// Spatial anchor component
function SpatialAnchor({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  const [anchored, setAnchored] = useState(false);
  
  useEffect(() => {
    if (enabled && !anchored) {
      // In production, this would use WebXR's anchor system
      // to lock the model to physical space
      console.log('Creating spatial anchor...');
      setAnchored(true);
    }
  }, [enabled, anchored]);
  
  if (!enabled || !anchored) return null;
  
  return (
    <mesh position={[0, 0, -1]}>
      <boxGeometry args={[0.02, 0.02, 0.02]} />
      <meshBasicMaterial color="#00ff00" />
    </mesh>
  );
}

// Instructions overlay
function Instructions({ vrMode }: { vrMode: boolean }) {
  if (vrMode) return null;
  
  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10 max-w-sm">
      <h3 className="font-semibold mb-2">WebXR Viewer Instructions</h3>
      <ul className="text-sm space-y-1 text-gray-600">
        <li>• Click "Enter VR" to launch in headset</li>
        <li>• Use controllers to rotate and inspect models</li>
        <li>• Hand tracking enabled for controller-free interaction</li>
        <li>• Spatial anchoring locks model to physical space</li>
        <li>• Pinch to zoom, grab to move</li>
      </ul>
    </div>
  );
}

// Main WebXR Viewer component
export function WebXRViewer({
  patientModel,
  implantModel,
  enableHandTracking = true,
  enableSpatialAnchoring = true
}: WebXRViewerProps) {
  const [vrMode, setVrMode] = useState(false);
  const [showPatient, setShowPatient] = useState(true);
  const [showImplant, setShowImplant] = useState(true);
  const [implantPosition, setImplantPosition] = useState<[number, number, number]>([0, 0, 0]);
  
  return (
    <div className="relative w-full h-full bg-gray-900">
      <Instructions vrMode={vrMode} />
      
      {/* Controls Overlay */}
      {!vrMode && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10">
          <h3 className="font-semibold mb-3 text-sm">Display Options</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPatient}
                onChange={(e) => setShowPatient(e.target.checked)}
              />
              Show Patient Anatomy
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showImplant}
                onChange={(e) => setShowImplant(e.target.checked)}
              />
              Show Implant
            </label>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Implant Position</label>
            <div className="grid grid-cols-3 gap-2">
              {['x', 'y', 'z'].map((axis, index) => (
                <div key={axis}>
                  <label className="text-xs text-gray-600">{axis.toUpperCase()}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={implantPosition[index]}
                    onChange={(e) => {
                      const newPos = [...implantPosition] as [number, number, number];
                      newPos[index] = parseFloat(e.target.value);
                      setImplantPosition(newPos);
                    }}
                    className="w-full p-1 border rounded text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 0.5], fov: 75 }}>
        <XR>
          <Controllers />
          {enableHandTracking && <Hands />}
          
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          <OrbitControls enableDamping dampingFactor={0.05} />
          
          {showPatient && <PatientModel model={patientModel} />}
          {showImplant && <ImplantModel model={implantModel} position={implantPosition} />}
          
          {enableSpatialAnchoring && <SpatialAnchor enabled={vrMode} />}
          
          {/* Reference grid */}
          <gridHelper args={[1, 10]} />
          <axesHelper args={[0.1, 0.1, 0.1]} />
        </XR>
      </Canvas>
      
      {/* VR Entry Button */}
      <VRButton />
    </div>
  );
}

// Desktop fallback component for non-VR browsers
export function WebXRViewerFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">WebXR Not Supported</h2>
        <p className="text-gray-300 mb-6">
          Your browser or device does not support WebXR. Please use a compatible
          VR headset (Meta Quest 3, HoloLens 2) or a WebXR-enabled browser.
        </p>
        <div className="space-y-2 text-sm text-gray-400">
          <p>Supported devices:</p>
          <ul className="list-disc list-inside">
            <li>Meta Quest 2/3</li>
            <li>HTC Vive XR Elite</li>
            <li>Microsoft HoloLens 2</li>
            <li>Pico 4</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Hook to check WebXR support
export function useWebXRSupport() {
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkSupport = async () => {
      if ('xr' in navigator) {
        const isSupported = await (navigator as any).xr.isSessionSupported('immersive-vr');
        setSupported(isSupported);
      }
      setLoading(false);
    };
    
    checkSupport();
  }, []);
  
  return { supported, loading };
}
