import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Activity, ArrowLeft, Save, Download, Play, Pause,
  Brain, AlertTriangle, TrendingUp, Clock, ChevronRight, Sliders,
  Target, FileText, Zap, Layers, Check, Info,
  RefreshCw, User, Mic, MicOff, AlertCircle, Thermometer
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

type LayerKey = "bones" | "muscles" | "tendons" | "cartilage" | "implant" | "nerves";
interface PlanningValues { angle: number; anteversion: number; depth: number; offset: number; }
interface MotionValues { flexion: number; extension: number; abduction: number; rotation: number; }

const patients = [
  { id: "P-2024-0142", name: "James R., 67M", diagnosis: "Glenohumeral OA Stage IV", implant: "Total Shoulder Arthroplasty" },
  { id: "P-2024-0138", name: "Susan K., 58F", diagnosis: "Rotator Cuff Tear + OA", implant: "Reverse Total Shoulder" },
  { id: "P-2024-0129", name: "Robert M., 72M", diagnosis: "Humeral Head AVN", implant: "Humeral Resurfacing" },
];

const recoveryData = [
  { week: "0", rom: 20, pain: 80, strength: 10 },
  { week: "2", rom: 35, pain: 65, strength: 18 },
  { week: "4", rom: 55, pain: 48, strength: 30 },
  { week: "6", rom: 70, pain: 35, strength: 45 },
  { week: "8", rom: 82, pain: 25, strength: 58 },
  { week: "12", rom: 95, pain: 15, strength: 70 },
  { week: "16", rom: 105, pain: 10, strength: 80 },
  { week: "24", rom: 120, pain: 8, strength: 88 },
  { week: "52", rom: 140, pain: 3, strength: 95 },
];

function ShoulderSimViewer({ layers, motionVals, heatmap, planning, simulationRunning }: {
  layers: Set<LayerKey>; motionVals: MotionValues; heatmap: boolean; planning: PlanningValues; simulationRunning: boolean;
}) {
  const angleDelta = Math.abs(planning.angle - 135) / 45;
  const anteDelta = Math.abs(planning.anteversion - 20) / 20;
  const stressLevel = Math.min((angleDelta + anteDelta) / 2, 1);
  const headRotation = motionVals.flexion * 0.35 - motionVals.extension * 0.2;
  const headOffset = motionVals.abduction * 0.12;
  const stressColor = stressLevel < 0.3 ? "rgba(34,197,94,0.5)" : stressLevel < 0.6 ? "rgba(234,179,8,0.5)" : "rgba(239,68,68,0.55)";
  const stressTextColor = stressLevel < 0.3 ? "text-green-400" : stressLevel < 0.6 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="relative h-[360px] rounded-xl overflow-hidden border border-border/40"
      style={{ background: "radial-gradient(ellipse at center, rgba(6,182,212,0.05) 0%, rgba(2,6,23,0.98) 70%)" }}>
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="simgrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(6,182,212,0.6)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#simgrid)" />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[260px] h-[260px]">
          {layers.has("muscles") && (
            <motion.div animate={simulationRunning ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-4 rounded-full border-2"
              style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 80%)", borderColor: "rgba(59,130,246,0.25)", transform: `rotate(${headOffset}deg)` }} />
          )}
          {layers.has("muscles") && [
            { label: "SUP", top: "8%", left: "36%", color: "rgba(139,92,246,0.4)" },
            { label: "INF", top: "58%", left: "60%", color: "rgba(59,130,246,0.35)" },
            { label: "TM", top: "66%", left: "40%", color: "rgba(34,197,94,0.3)" },
            { label: "SS", top: "36%", left: "14%", color: "rgba(249,115,22,0.35)" },
          ].map((m) => (
            <motion.div key={m.label} className="absolute w-10 h-7 rounded-full flex items-center justify-center text-[7px] font-bold text-white/60"
              style={{ top: m.top, left: m.left, background: m.color, border: `1px solid ${m.color}` }}
              animate={simulationRunning ? { opacity: [0.6, 1, 0.6] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}>
              {m.label}
            </motion.div>
          ))}
          {layers.has("tendons") && (
            <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
              <line x1="60" y1="52" x2="125" y2="105" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5" strokeDasharray="3,2"/>
              <line x1="205" y1="170" x2="160" y2="142" stroke="rgba(251,191,36,0.4)" strokeWidth="1.5" strokeDasharray="3,2"/>
              <line x1="46" y1="126" x2="110" y2="136" stroke="rgba(251,191,36,0.4)" strokeWidth="1.5" strokeDasharray="3,2"/>
              <line x1="130" y1="55" x2="130" y2="105" stroke="rgba(248,113,113,0.4)" strokeWidth="1" strokeDasharray="4,2"/>
            </svg>
          )}
          {layers.has("bones") && (
            <div className="absolute rounded-full border-2"
              style={{ width: 78, height: 94, top: "37%", left: "28%", background: "radial-gradient(ellipse at 40% 40%, rgba(226,232,240,0.14), rgba(148,163,184,0.05))", borderColor: "rgba(148,163,184,0.4)" }} />
          )}
          {layers.has("cartilage") && (
            <div className="absolute rounded-full" style={{ width: 86, height: 102, top: "calc(37% - 4px)", left: "calc(28% - 4px)", border: "2px solid rgba(134,239,172,0.3)", boxShadow: "0 0 8px rgba(134,239,172,0.15)" }} />
          )}
          {layers.has("implant") && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="absolute rounded-full border border-cyan-400/50"
              style={{ width: 70, height: 86, top: "calc(37% + 4px)", left: "calc(28% + 4px)", background: "radial-gradient(ellipse at 40% 30%, rgba(6,182,212,0.18), rgba(6,182,212,0.05))", boxShadow: "0 0 12px rgba(6,182,212,0.2)" }} />
          )}
          {layers.has("bones") && (
            <motion.div
              animate={{ x: headOffset, rotate: headRotation, y: simulationRunning ? [0, -4, 0] : 0 }}
              transition={{ duration: simulationRunning ? 2 : 0.3, repeat: simulationRunning ? Infinity : 0, ease: simulationRunning ? "easeInOut" : "easeOut" }}
              className="absolute rounded-full border-2"
              style={{ width: 92, height: 92, top: "33%", left: "32%", background: "radial-gradient(circle at 35% 30%, rgba(226,232,240,0.22), rgba(148,163,184,0.08))", borderColor: "rgba(203,213,225,0.5)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }} />
          )}
          {layers.has("implant") && (
            <motion.div animate={{ x: headOffset }}
              style={{ position: "absolute", width: 8, height: 76, top: "54%", left: "calc(46% + 4px)", background: "linear-gradient(to bottom, rgba(6,182,212,0.6), rgba(6,182,212,0.15))", borderRadius: 4, transform: `rotate(${(planning.angle - 135) * 0.3}deg)`, transformOrigin: "top" }} />
          )}
          {layers.has("nerves") && (
            <svg className="absolute inset-0 w-full h-full opacity-50">
              <path d="M 75 135 Q 95 115 130 125 Q 170 135 190 155" fill="none" stroke="rgba(250,204,21,0.6)" strokeWidth="1" strokeDasharray="4,3"/>
              <path d="M 85 96 Q 114 90 130 104" fill="none" stroke="rgba(250,204,21,0.5)" strokeWidth="1" strokeDasharray="4,3"/>
            </svg>
          )}
          {heatmap && (
            <motion.div animate={{ opacity: [0.5, 0.85, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
              className="absolute rounded-full pointer-events-none"
              style={{ width: 116, height: 116, top: "calc(33% - 12px)", left: "calc(32% - 12px)", background: `radial-gradient(circle at ${30 + stressLevel * 20}% ${30 + stressLevel * 20}%, ${stressColor}, transparent 70%)`, filter: "blur(5px)" }} />
          )}
          <svg className="absolute inset-0 w-full h-full opacity-15">
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="4,4"/>
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="4,4"/>
            <circle cx="50%" cy="50%" r="58" fill="none" stroke="#06b6d4" strokeWidth="0.4" strokeDasharray="3,6"/>
          </svg>
        </div>
      </div>

      <div className="absolute top-3 left-3 text-[10px] font-mono text-primary/70 space-y-0.5">
        <div>FLEX: {motionVals.flexion}°</div>
        <div>ABD: {motionVals.abduction}°</div>
        <div>ROT: {motionVals.rotation}°</div>
      </div>
      <div className="absolute top-3 right-3 text-[10px] font-mono text-right space-y-0.5">
        <div className="text-primary/70">ANG: {planning.angle}°</div>
        <div className="text-primary/70">ANT: {planning.anteversion}°</div>
        <div className={`font-bold ${stressTextColor}`}>STRESS: {Math.round(stressLevel * 100)}%</div>
      </div>
      {simulationRunning && (
        <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}
          className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] font-mono text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" /> SIM RUNNING
        </motion.div>
      )}
    </div>
  );
}

function AIAdvisorTab({ planning }: { planning: PlanningValues }) {
  const [voiceActive, setVoiceActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const mockResponses = [
    "Based on CT morphology and bone quality score of 7.2/10, Total Shoulder Arthroplasty with a 36mm glenoid component is optimal. The patient's glenohumeral OA Stage IV and preserved deltoid function make TSA the evidence-based choice over RSA.",
    `Current inclination angle of ${planning.angle}° ${Math.abs(planning.angle - 135) > 10 ? "deviates significantly from the ideal 135°. Consider adjusting to reduce superior migration risk by ~18%" : "is within acceptable range (130-140°). Minor optimization possible"}.`,
    "Predicted 10-year implant survival: 94.2% based on comparable patient cohorts (n=1,247). Primary risk factors: contralateral ASES score, BMI 28.4, bone mineral density T-score -1.2.",
  ];
  const handleQuery = () => {
    if (!query.trim()) return;
    setIsTyping(true); setResponse(null);
    setTimeout(() => { setIsTyping(false); setResponse(mockResponses[Math.floor(Math.random() * mockResponses.length)]); }, 1800);
    setQuery("");
  };
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-2 mb-3">
          <Brain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-foreground mb-1">AI Recommendation — <span className="text-primary">94.7% confidence</span></div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Total Shoulder Arthroplasty (TSA)</strong> with cemented glenoid. Preferred over RSA due to intact rotator cuff and active patient profile.
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[{ label: "Success Rate", value: "94.2%", good: true }, { label: "ROM Predicted", value: "138°", good: true }, { label: "Revision Risk", value: "5.8%", good: true }, { label: "Recovery", value: "8–12 mo", good: null }].map(s => (
            <div key={s.label} className="bg-background/50 rounded-lg p-2 text-center">
              <div className={`text-sm font-bold font-mono ${s.good === true ? "text-green-400" : s.good === false ? "text-red-400" : "text-primary"}`}>{s.value}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">Contraindications & Warnings</span>
        </div>
        {["Active infection — screen with CRP/ESR pre-operatively", "Axillary nerve palsy — verify motor function", "Severe glenoid bone loss — consider RSA if >30% erosion"].map((c, i) => (
          <div key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5 mt-1.5">
            <span className="text-yellow-400 mt-0.5 flex-shrink-0">•</span>{c}
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-background/40 border border-border/40 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold">Ask AI Advisor</span>
          <button onClick={() => setVoiceActive(v => !v)}
            className={`ml-auto w-6 h-6 rounded-full flex items-center justify-center transition-all ${voiceActive ? "bg-red-500/20 text-red-400" : "bg-border/40 text-muted-foreground"}`}>
            {voiceActive ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          </button>
        </div>
        {voiceActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2 flex items-center gap-2 text-[10px] text-red-400 font-mono">
            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-2 h-2 rounded-full bg-red-500" />
            Listening… speak your query
          </motion.div>
        )}
        {response && !isTyping && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mb-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15 text-[11px] text-muted-foreground leading-relaxed">{response}</motion.div>
        )}
        {isTyping && (
          <div className="mb-2 flex items-center gap-1 px-1">
            {[0.1, 0.2, 0.3].map(d => (
              <motion.div key={d} animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }} className="w-1.5 h-1.5 rounded-full bg-primary" />
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleQuery()}
            placeholder="Ask about risks, alternatives, outcomes…"
            className="flex-1 text-[11px] bg-background/60 border border-border/40 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50" />
          <button onClick={handleQuery} className="px-3 py-2 rounded-lg bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-all">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ComplicationsTab({ planning }: { planning: PlanningValues }) {
  const ad = Math.abs(planning.angle - 135) / 45;
  const aa = Math.abs(planning.anteversion - 20) / 20;
  const dd = Math.abs(planning.depth - 28) / 16;
  const risks = [
    { label: "Dislocation Risk", value: Math.min(20 + ad * 35 + aa * 20, 85), icon: AlertTriangle },
    { label: "Implant Loosening", value: Math.min(12 + dd * 40 + ad * 15, 70), icon: AlertCircle },
    { label: "Revision (10yr)", value: Math.min(8 + ad * 25 + aa * 15, 60), icon: RefreshCw },
    { label: "Infection Risk", value: Math.min(3 + dd * 5 + 2, 18), icon: Zap },
    { label: "Scapular Notching", value: Math.min(15 + aa * 30 + ad * 20, 75), icon: Target },
    { label: "Long-term Wear", value: Math.min(10 + dd * 20 + ad * 15, 55), icon: Clock },
  ];
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Risk assessment updates in real-time based on your Planning parameters.</p>
      {risks.map((r) => {
        const color = r.value < 25 ? "bg-green-500" : r.value < 50 ? "bg-yellow-500" : "bg-red-500";
        const tc = r.value < 25 ? "text-green-400" : r.value < 50 ? "text-yellow-400" : "text-red-400";
        return (
          <div key={r.label} className="bg-background/40 rounded-lg p-3 border border-border/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><r.icon className={`w-3.5 h-3.5 ${tc}`} /><span className="text-xs font-medium">{r.label}</span></div>
              <span className={`text-xs font-bold font-mono ${tc}`}>{Math.round(r.value)}%</span>
            </div>
            <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${r.value}%` }} transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${color}`} />
            </div>
          </div>
        );
      })}
      <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2 text-[11px] text-muted-foreground">
        <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
        <span>Ideal placement: 135° inclination, 20° anteversion. Current deviation: <span className="text-primary font-medium">{Math.round(Math.abs(planning.angle - 135))}° inclination</span>, <span className="text-primary font-medium">{Math.round(Math.abs(planning.anteversion - 20))}° anteversion</span>.</span>
      </div>
    </div>
  );
}

function RecoveryTab() {
  return (
    <div className="space-y-4">
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={recoveryData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
            <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey="rom" name="ROM (°)" stroke="#06b6d4" fill="rgba(6,182,212,0.1)" strokeWidth={2} />
            <Area type="monotone" dataKey="strength" name="Strength (%)" stroke="#3b82f6" fill="rgba(59,130,246,0.08)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {[
          { week: "Week 1–2", label: "Sling immobilization, passive ROM exercises begin", icon: Clock },
          { week: "Week 4–6", label: "Active-assisted ROM, grip strengthening initiated", icon: TrendingUp },
          { week: "Week 8–12", label: "Active ROM, light resistive exercises", icon: Zap },
          { week: "Month 4–6", label: "Progressive strengthening, functional activities", icon: Target },
          { week: "Month 6–12", label: "Return to sport/work, full ROM expected", icon: Check },
        ].map((m) => (
          <div key={m.week} className="flex items-start gap-3 p-2.5 rounded-lg bg-background/40 border border-border/40">
            <m.icon className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <div><div className="text-xs font-bold text-primary">{m.week}</div><div className="text-[11px] text-muted-foreground">{m.label}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanningTab({ planning, setPlanningValues }: { planning: PlanningValues; setPlanningValues: (fn: (p: PlanningValues) => PlanningValues) => void }) {
  const implants = ["Arthrex Univers Arch TSA", "Zimmer Biomet Comprehensive", "DJO Global ReUnion TSA", "Stryker Triathlon Total Shoulder", "Smith & Nephew GLOBAL UNITE"];
  const controls = [
    { key: "angle" as keyof PlanningValues, label: "Glenoid Inclination", min: 110, max: 155, unit: "°", optimal: 135 },
    { key: "anteversion" as keyof PlanningValues, label: "Glenoid Anteversion", min: 5, max: 40, unit: "°", optimal: 20 },
    { key: "depth" as keyof PlanningValues, label: "Cup Penetration Depth", min: 20, max: 38, unit: "mm", optimal: 28 },
    { key: "offset" as keyof PlanningValues, label: "Humeral Offset", min: -10, max: 10, unit: "mm", optimal: 0 },
  ];
  return (
    <div className="space-y-4">
      <div>
        <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Implant System</label>
        <select className="w-full text-xs bg-background/60 border border-border/40 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary/50">
          {implants.map(i => <option key={i}>{i}</option>)}
        </select>
      </div>
      {controls.map(({ key, label, min, max, unit, optimal }) => {
        const val = planning[key];
        const dev = Math.abs(val - optimal);
        const dc = dev < 3 ? "text-green-400" : dev < 8 ? "text-yellow-400" : "text-red-400";
        return (
          <div key={key} className="bg-background/40 rounded-lg p-3 border border-border/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Opt: {optimal}{unit}</span>
                <span className={`text-xs font-bold font-mono ${dc}`}>{val}{unit}</span>
              </div>
            </div>
            <input type="range" min={min} max={max} value={val}
              onChange={e => setPlanningValues(p => ({ ...p, [key]: Number(e.target.value) }))}
              className="w-full h-1.5 appearance-none rounded-full bg-border/50 cursor-pointer accent-primary" />
            <div className="flex justify-between mt-1 text-[9px] text-muted-foreground"><span>{min}{unit}</span><span>{max}{unit}</span></div>
          </div>
        );
      })}
      <button className="w-full py-2.5 rounded-xl bg-primary/20 text-primary text-xs font-medium border border-primary/30 hover:bg-primary/30 transition-all flex items-center justify-center gap-2">
        <FileText className="w-3.5 h-3.5" />Generate Planning Report
      </button>
    </div>
  );
}

function FailureSimTab({ planning }: { planning: PlanningValues }) {
  const [playing, setPlaying] = useState(false);
  const sl = Math.min((Math.abs(planning.angle - 135) / 45 + Math.abs(planning.anteversion - 20) / 20) / 2, 1);
  const failureModes = [
    { name: "Superior Migration", top: "24%", left: "38%", risk: Math.min(sl * 60 + 10, 70), desc: "Rotator cuff tear leading to proximal head migration" },
    { name: "Glenoid Loosening", top: "42%", left: "30%", risk: Math.min(sl * 50 + 8, 55), desc: "Eccentric loading — rocking horse phenomenon" },
    { name: "Stress Concentration", top: "56%", left: "43%", risk: Math.min(sl * 70 + 15, 80), desc: "Implant-bone shear exceeding fatigue threshold" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Failure Mode Replay</span>
        <button onClick={() => setPlaying(p => !p)}
          className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border transition-all ${playing ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-border/30 text-muted-foreground border-border/40 hover:text-foreground"}`}>
          {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {playing ? "Stop" : "Run Replay"}
        </button>
      </div>
      <div className="h-[140px] rounded-xl border border-border/40 relative overflow-hidden flex items-center justify-center"
        style={{ background: "radial-gradient(ellipse, rgba(239,68,68,0.04), rgba(2,6,23,0.95))" }}>
        <div className="relative w-[160px] h-[160px]">
          <div className="absolute w-16 h-16 rounded-full border border-slate-600/50" style={{ top: "28%", left: "26%", background: "rgba(148,163,184,0.06)" }} />
          <div className="absolute w-20 h-20 rounded-full border border-slate-500/30" style={{ top: "22%", left: "22%", background: "rgba(148,163,184,0.04)" }} />
          {failureModes.map((f) => (
            <motion.div key={f.name}
              animate={playing ? { scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] } : { scale: 1, opacity: 0.5 }}
              transition={{ duration: 1.5, repeat: playing ? Infinity : 0 }}
              className="absolute w-6 h-6 rounded-full"
              style={{ top: f.top, left: f.left, background: `radial-gradient(circle, rgba(239,68,68,${0.3 + f.risk / 200}), transparent)`, border: "1px solid rgba(239,68,68,0.5)" }} />
          ))}
        </div>
        {playing && (
          <div className="absolute bottom-2 left-2 text-[9px] font-mono text-red-400 flex items-center gap-1">
            <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>●</motion.span>
            REPLAYING FAILURE SEQUENCE
          </div>
        )}
      </div>
      {failureModes.map((f) => (
        <div key={f.name} className="p-3 rounded-lg bg-background/40 border border-border/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">{f.name}</span>
            <span className={`text-xs font-mono font-bold ${f.risk < 30 ? "text-green-400" : f.risk < 55 ? "text-yellow-400" : "text-red-400"}`}>{Math.round(f.risk)}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-1.5">{f.desc}</p>
          <div className="h-1 bg-border/40 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${f.risk}%` }} transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${f.risk < 30 ? "bg-green-500" : f.risk < 55 ? "bg-yellow-500" : "bg-red-500"}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SimulationPage() {
  const [selectedPatient, setSelectedPatient] = useState(0);
  const [layers, setLayers] = useState<Set<LayerKey>>(new Set(["bones", "muscles", "tendons", "cartilage", "implant"]));
  const [motionVals, setMotionVals] = useState<MotionValues>({ flexion: 30, extension: 10, abduction: 45, rotation: 15 });
  const [heatmap, setHeatmap] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");
  const [planning, setPlanningValues] = useState<PlanningValues>({ angle: 135, anteversion: 20, depth: 28, offset: 0 });
  const [saved, setSaved] = useState(false);

  const toggleLayer = (k: LayerKey) => setLayers(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const tabs = [
    { id: "ai", label: "AI Advisor", icon: Brain },
    { id: "comp", label: "Complications", icon: AlertTriangle },
    { id: "recovery", label: "Recovery", icon: TrendingUp },
    { id: "planning", label: "Planning", icon: Sliders },
    { id: "failure", label: "Failure Sim", icon: AlertCircle },
  ];

  const layerConfig: { key: LayerKey; label: string; color: string }[] = [
    { key: "bones", label: "Bones", color: "bg-slate-400" },
    { key: "muscles", label: "Muscles", color: "bg-blue-500" },
    { key: "tendons", label: "Tendons", color: "bg-yellow-500" },
    { key: "cartilage", label: "Cartilage", color: "bg-green-500" },
    { key: "implant", label: "Implant", color: "bg-cyan-500" },
    { key: "nerves", label: "Nerves", color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"><ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Home</span></Link>
            <div className="w-px h-5 bg-border/50" />
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="font-display font-bold text-sm">ShoulderSIM <span className="text-primary">AI</span></span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/60 border border-border/40 text-xs">
              <User className="w-3 h-3 text-primary" />
              <select value={selectedPatient} onChange={e => setSelectedPatient(Number(e.target.value))} className="bg-transparent text-xs border-none outline-none cursor-pointer">
                {patients.map((p, i) => <option key={p.id} value={i}>{p.id} — {p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-muted-foreground bg-card/40 border border-border/40 px-2.5 py-1.5 rounded-lg">
              <span className="text-green-400">●</span>{patients[selectedPatient].diagnosis}
            </div>
            <button onClick={() => setSimulationRunning(r => !r)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${simulationRunning ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"}`}>
              {simulationRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {simulationRunning ? "Stop Sim" : "Run Sim"}
            </button>
            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/60 border border-border/40 text-xs text-muted-foreground hover:text-foreground transition-all">
              {saved ? <Check className="w-3 h-3 text-green-400" /> : <Save className="w-3 h-3" />}
              {saved ? "Saved!" : "Save"}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/60 border border-border/40 text-xs text-muted-foreground hover:text-foreground transition-all">
              <Download className="w-3 h-3" /><span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-6">
          <div className="space-y-4">
            <ShoulderSimViewer layers={layers} motionVals={motionVals} heatmap={heatmap} planning={planning} simulationRunning={simulationRunning} />
            <div className="bg-card/50 border border-border/60 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold"><Layers className="w-3.5 h-3.5 text-primary" />Anatomy Layers</div>
                <button onClick={() => setHeatmap(h => !h)}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-all border ${heatmap ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-border/30 text-muted-foreground border-border/40 hover:text-foreground"}`}>
                  <Thermometer className="w-3 h-3" />Heatmap
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {layerConfig.map(({ key, label, color }) => (
                  <button key={key} onClick={() => toggleLayer(key)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all border ${layers.has(key) ? "bg-card border-border/60 text-foreground" : "bg-transparent border-border/30 text-muted-foreground"}`}>
                    <span className={`w-2 h-2 rounded-full ${layers.has(key) ? color : "bg-border/50"}`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-card/50 border border-border/60 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-3"><RefreshCw className="w-3.5 h-3.5 text-primary" />Motion Simulation</div>
              <div className="space-y-3">
                {[
                  { key: "flexion" as keyof MotionValues, label: "Flexion", max: 180 },
                  { key: "abduction" as keyof MotionValues, label: "Abduction", max: 180 },
                  { key: "rotation" as keyof MotionValues, label: "Ext. Rotation", max: 90 },
                  { key: "extension" as keyof MotionValues, label: "Extension", max: 60 },
                ].map(({ key, label, max }) => (
                  <div key={key}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono text-primary">{motionVals[key]}°</span>
                    </div>
                    <input type="range" min={0} max={max} value={motionVals[key]}
                      onChange={e => setMotionVals(m => ({ ...m, [key]: Number(e.target.value) }))}
                      className="w-full h-1.5 appearance-none rounded-full bg-border/50 cursor-pointer accent-primary" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card/50 border border-border/60 rounded-xl backdrop-blur-sm overflow-hidden">
            <div className="flex border-b border-border/60 overflow-x-auto">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${activeTab === t.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  <t.icon className="w-3.5 h-3.5" />{t.label}
                </button>
              ))}
            </div>
            <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  {activeTab === "ai" && <AIAdvisorTab planning={planning} />}
                  {activeTab === "comp" && <ComplicationsTab planning={planning} />}
                  {activeTab === "recovery" && <RecoveryTab />}
                  {activeTab === "planning" && <PlanningTab planning={planning} setPlanningValues={setPlanningValues} />}
                  {activeTab === "failure" && <FailureSimTab planning={planning} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
