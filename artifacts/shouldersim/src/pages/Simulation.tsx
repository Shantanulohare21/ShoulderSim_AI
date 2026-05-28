import { useState, useRef } from "react";
import { Upload, Play, FileUp, AlertCircle, CheckCircle, BarChart3, Activity, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { simulationImplants, simulationResults } from "../data/mockData";

type Phase = "idle" | "uploading" | "running" | "results";

export default function Simulation() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<string | null>(null);
  const [implant, setImplant] = useState("");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0].name);
      setPhase("uploading");
      setTimeout(() => setPhase("idle"), 1200);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f.name);
      setPhase("uploading");
      setTimeout(() => setPhase("idle"), 1200);
    }
  };

  const runSimulation = () => {
    if (!implant) return;
    setPhase("running");
    setProgress(0);
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 100) {
        p = 100;
        clearInterval(intervalRef.current!);
        setTimeout(() => setPhase("results"), 400);
      }
      setProgress(Math.min(p, 100));
    }, 150);
  };

  const reset = () => {
    setPhase("idle");
    setFile(null);
    setImplant("");
    setProgress(0);
  };

  const chartData = simulationResults.implants.map((imp) => ({
    name: imp.name.split(" ").slice(-1)[0] + " " + imp.name.split(" ").slice(-2, -1)[0],
    score: imp.score,
    full: imp.name,
  }));

  const runningMessages = [
    "Parsing DICOM geometry...",
    "Generating 3D bone model...",
    "Initializing FEA mesh...",
    "Running biomechanical simulation...",
    "Applying AI prediction layer...",
    "Scoring implant configurations...",
    "Generating recommendations...",
  ];

  const msgIdx = Math.min(Math.floor(progress / 15), runningMessages.length - 1);

  return (
    <div>
      <section className="relative bg-[hsl(222,47%,5%)] border-b border-[hsl(217,32%,14%)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-3">Interactive Demo</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Simulation Sandbox</h1>
          <p className="text-[hsl(215,20%,60%)] max-w-xl mx-auto">
            Upload a scan, select an implant, and run a full biomechanical AI simulation in under 2 minutes.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                file
                  ? "border-[hsl(188,100%,45%,0.6)] bg-[hsl(188,100%,45%,0.05)]"
                  : "border-[hsl(217,32%,24%)] hover:border-[hsl(188,100%,45%,0.4)] hover:bg-[hsl(217,32%,12%)]"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              data-testid="upload-zone"
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".dcm,.dicom,.nii,.gz"
                onChange={handleFile}
                data-testid="input-file"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {file ? (
                  <>
                    <CheckCircle className="w-10 h-10 text-[hsl(188,100%,45%)] mx-auto mb-3" />
                    <div className="text-sm font-semibold text-[hsl(188,100%,45%)] mb-1">{file}</div>
                    <div className="text-xs text-[hsl(215,20%,55%)]">Scan loaded successfully</div>
                  </>
                ) : (
                  <>
                    <FileUp className="w-10 h-10 text-[hsl(215,20%,40%)] mx-auto mb-3" />
                    <div className="text-sm font-semibold text-white mb-1">Upload CT/MRI Scan</div>
                    <div className="text-xs text-[hsl(215,20%,55%)] mb-3">DICOM, NIfTI formats supported</div>
                    <div className="inline-block px-3 py-1.5 text-xs rounded border border-[hsl(217,32%,24%)] text-[hsl(215,20%,65%)] hover:border-[hsl(188,100%,45%,0.5)]">
                      Browse Files
                    </div>
                  </>
                )}
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Select Implant</label>
              <select
                value={implant}
                onChange={(e) => setImplant(e.target.value)}
                className="w-full bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,20%)] rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[hsl(188,100%,45%,0.6)] transition-colors"
                data-testid="select-implant"
              >
                <option value="">-- Select from library --</option>
                {simulationImplants.map((imp) => (
                  <option key={imp.id} value={imp.id}>
                    {imp.name} ({imp.type})
                  </option>
                ))}
              </select>
            </div>

            {!file && (
              <div className="flex items-start gap-2 text-xs text-[hsl(215,20%,50%)] bg-[hsl(222,47%,7%)] border border-[hsl(217,32%,16%)] rounded p-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>No scan uploaded? The demo will run with a pre-loaded anonymized case (SSM-2024-0441).</span>
              </div>
            )}

            <button
              onClick={runSimulation}
              disabled={!implant || phase === "running"}
              data-testid="button-run-simulation"
              className={`w-full py-3 rounded font-semibold flex items-center justify-center gap-2 transition-all ${
                implant && phase !== "running"
                  ? "bg-[hsl(188,100%,45%)] text-[hsl(222,47%,6%)] hover:bg-[hsl(188,100%,50%)] glow-cyan"
                  : "bg-[hsl(217,32%,14%)] text-[hsl(215,20%,40%)] cursor-not-allowed"
              }`}
            >
              <Play className="w-4 h-4" />
              {phase === "running" ? "Simulating..." : "Run Simulation"}
            </button>

            {phase === "results" && (
              <button onClick={reset} className="w-full py-2 rounded text-sm text-[hsl(215,20%,55%)] border border-[hsl(217,32%,20%)] hover:border-[hsl(215,20%,30%)] transition-colors">
                Reset Simulation
              </button>
            )}
          </div>

          <div className="lg:col-span-3">
            {phase === "idle" && !file && (
              <div className="h-full min-h-64 flex flex-col items-center justify-center text-center bg-[hsl(222,47%,7%)] border border-[hsl(217,32%,16%)] rounded-lg p-12">
                <BarChart3 className="w-12 h-12 text-[hsl(215,20%,30%)] mb-4" />
                <div className="text-[hsl(215,20%,45%)] text-sm">Select an implant and click Run Simulation to see results</div>
              </div>
            )}

            {(phase === "idle" && file) && (
              <div className="h-full min-h-64 flex flex-col items-center justify-center text-center bg-[hsl(222,47%,7%)] border border-[hsl(217,32%,16%)] rounded-lg p-12">
                <Upload className="w-12 h-12 text-[hsl(188,100%,45%,0.5)] mb-4" />
                <div className="text-white font-semibold mb-1">Scan ready</div>
                <div className="text-[hsl(215,20%,55%)] text-sm">Select an implant and run simulation</div>
              </div>
            )}

            {phase === "uploading" && (
              <div className="h-full min-h-64 flex flex-col items-center justify-center bg-[hsl(222,47%,7%)] border border-[hsl(217,32%,16%)] rounded-lg p-12">
                <div className="w-12 h-12 rounded-full border-2 border-[hsl(188,100%,45%)] border-t-transparent animate-spin mb-4" />
                <div className="text-white text-sm">Processing scan...</div>
              </div>
            )}

            {phase === "running" && (
              <div className="bg-[hsl(222,47%,7%)] border border-[hsl(217,32%,16%)] rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full border-2 border-[hsl(188,100%,45%)] border-t-transparent animate-spin" />
                  <div>
                    <div className="text-white font-semibold text-sm">Running Simulation</div>
                    <div className="text-xs text-[hsl(188,100%,45%)] font-mono mt-0.5">{runningMessages[msgIdx]}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "FEA Mesh Generation", done: progress > 20 },
                    { label: "Biomechanical Solver", done: progress > 40 },
                    { label: "AI Prediction Layer", done: progress > 65 },
                    { label: "Results Compilation", done: progress > 85 },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-3 text-sm">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${step.done ? "bg-[hsl(188,100%,45%)] border-[hsl(188,100%,45%)]" : "border-[hsl(217,32%,24%)]"}`}>
                        {step.done && <CheckCircle className="w-3 h-3 text-[hsl(222,47%,6%)]" />}
                      </div>
                      <span className={step.done ? "text-white" : "text-[hsl(215,20%,45%)]"}>{step.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-[hsl(215,20%,55%)] mb-1">
                    <span>Progress</span>
                    <span className="font-mono">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-[hsl(217,32%,14%)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[hsl(188,100%,45%)] transition-all duration-200"
                      style={{ width: `${progress}%`, boxShadow: "0 0 8px hsl(188,100%,45%,0.5)" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {phase === "results" && (
              <div className="space-y-5" data-testid="simulation-results">
                <div className="bg-[hsl(188,100%,45%,0.08)] border border-[hsl(188,100%,45%,0.3)] rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[hsl(188,100%,45%)] flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-[hsl(222,47%,6%)]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(188,100%,45%)] mb-1">AI Recommendation</div>
                      <div className="text-white font-bold text-lg mb-1">{simulationResults.recommendation.implant}, {simulationResults.recommendation.size}</div>
                      <div className="text-sm text-[hsl(215,20%,65%)] mb-2">Approach: {simulationResults.recommendation.approach}</div>
                      <div className="text-sm text-[hsl(215,20%,60%)] leading-relaxed">{simulationResults.recommendation.rationale}</div>
                    </div>
                    <div className="shrink-0 text-center">
                      <div className="text-3xl font-bold text-[hsl(188,100%,45%)]">{simulationResults.recommendation.confidence}%</div>
                      <div className="text-xs text-[hsl(215,20%,55%)]">confidence</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-[hsl(188,100%,45%)]" />
                    <h3 className="text-sm font-semibold text-white">Implant Confidence Scores</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} barCategoryGap="30%">
                      <XAxis dataKey="name" tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[60, 100]} tick={{ fill: "hsl(215,20%,40%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "hsl(222,47%,8%)", border: "1px solid hsl(217,32%,20%)", borderRadius: 6, color: "white", fontSize: 12 }}
                        formatter={(v: number) => [`${v}%`, "Confidence"]}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? "hsl(188,100%,45%)" : i === 1 ? "hsl(210,100%,60%)" : "hsl(217,32%,30%)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-[hsl(188,100%,45%)]" />
                      <h3 className="text-sm font-semibold text-white">Range of Motion</h3>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-[hsl(215,20%,45%)]">
                          <td className="pb-1.5">Implant</td>
                          <td className="pb-1.5 text-right">Flex / ER / ABD</td>
                        </tr>
                      </thead>
                      <tbody className="space-y-1">
                        {simulationResults.implants.map((imp) => (
                          <tr key={imp.name} className="border-t border-[hsl(217,32%,14%)]">
                            <td className="py-1.5 text-[hsl(215,20%,65%)] pr-2 truncate max-w-[100px]">{imp.name.split(" ").slice(-2).join(" ")}</td>
                            <td className="py-1.5 text-right font-mono text-white">{imp.rom}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-[hsl(222,47%,8%)] border border-[hsl(217,32%,16%)] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-[hsl(188,100%,45%)]" />
                      <h3 className="text-sm font-semibold text-white">Stress Distribution</h3>
                    </div>
                    <div className="relative w-full h-24 rounded overflow-hidden">
                      <div className="absolute inset-0" style={{background:"linear-gradient(to right, hsl(240,80%,40%), hsl(188,100%,45%), hsl(120,80%,45%), hsl(60,100%,50%), hsl(0,80%,50%))"}}>
                        <div className="absolute inset-0 opacity-30" style={{background:"radial-gradient(ellipse 70% 60% at 30% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)"}} />
                        <div className="absolute inset-0 opacity-50" style={{background:"radial-gradient(ellipse 40% 50% at 65% 45%, rgba(255,200,0,0.6) 0%, transparent 60%)"}} />
                      </div>
                      <div className="absolute bottom-1 right-1 text-xs text-white font-mono bg-black/40 px-1 rounded">Max: 48.2 MPa</div>
                    </div>
                    <div className="flex justify-between text-xs text-[hsl(215,20%,45%)] mt-1">
                      <span>Low</span><span>Medium</span><span>High</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
