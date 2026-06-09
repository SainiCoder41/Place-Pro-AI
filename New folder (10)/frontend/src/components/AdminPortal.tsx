import React, { useState } from "react";
import { 
  ShieldCheck, Cpu, Database, Server, Settings, Activity, Users, 
  Trash2, Plus, RefreshCw, KeyRound, CheckCircle2, Lock, LayoutDashboard
} from "lucide-react";
import { StudentProfile, Job, Application } from "../types";
import BorderGlow from "./BorderGlow";
import ShimmerButton from "./ShimmerButton";

interface AdminPortalProps {
  students: StudentProfile[];
  jobs: Job[];
  applications: Application[];
  onDeleteStudent: (studentId: string) => void;
  onGrantVerification: (studentId: string) => void;
  onClearCache: () => void;
}

export default function AdminPortal({
  students,
  jobs,
  applications,
  onDeleteStudent,
  onGrantVerification,
  onClearCache
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<"users" | "monitors" | "configurations">("users");
  const [logs, setLogs] = useState<string[]>([
    "[11:15:30] SYSTEM INITIALIZED: Express listener running at host 0.0.0.0 bind port 3000",
    "[11:15:32] GEMINI COMPILER: API client successfully built with standard User-Agent header",
    "[11:16:02] ATS ENGINE: Processed resume text matching standard AST definitions",
    "[11:20:15] AUTHENTICATION: Local developer session authorized for admin workspace",
    "[11:21:44] ANALYTICS METRIC: Successfully evaluated fit rankings for candidates applying to Software Intern jobs",
  ]);

  const [simulatedLoad, setSimulatedLoad] = useState({
    cpu: 18,
    memory: 452,
    apiRequests: 142
  });

  const [isRefreshingMonitor, setIsRefreshingMonitor] = useState(false);

  const triggerRefreshSystemState = () => {
    setIsRefreshingMonitor(true);
    setTimeout(() => {
      setSimulatedLoad({
        cpu: Math.floor(Math.random() * 25) + 10,
        memory: Math.floor(Math.random() * 80) + 420,
        apiRequests: simulatedLoad.apiRequests + Math.floor(Math.random() * 15)
      });
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] MONITORS POLLING: Successfully verified microservice states`,
        ...prev
      ]);
      setIsRefreshingMonitor(false);
    }, 400);
  };

  const handleEvacuateSystemCache = () => {
    onClearCache();
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] MEMORY CLEANUP: Truncated Express static file compiler and Drizzle session cookies`,
      ...prev
    ]);
    alert("Application session cache database state truncated successfully!");
  };

  return (
    <div className="bg-[#F7F6EE] text-[#2C3E2B] rounded-3xl overflow-hidden border border-neutral-300/40 shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[750px] overflow-y-hidden">
      
      {/* LEFT PERSISTENT SIDEBAR - Admin Slate */}
      <aside className="lg:col-span-3 bg-[#E3ECE1] border-r border-[#D4DFD2] p-6 flex flex-col justify-between overflow-y-hidden">
        <div className="flex flex-col gap-8">
          
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center font-bold shadow-[0_4px_10px_rgba(224,30,94,0.25)]">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-black tracking-tight text-[#1A301E] leading-none">AdminAI</h2>
              <span className="text-[9px] font-mono tracking-wider text-emerald-800 uppercase font-semibold mt-1 block">Superuser Panel</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono tracking-widest font-bold text-emerald-900/60 uppercase block mb-2.5">System Operations</span>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "users" 
                ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
              }`}
            >
              <Users className="w-4 h-4" /> User Database
            </button>
            <button
              onClick={() => setActiveTab("monitors")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "monitors" 
                ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
              }`}
            >
              <Cpu className="w-4 h-4" /> Live Monitors
            </button>
            <button
              onClick={() => setActiveTab("configurations")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "configurations" 
                ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
              }`}
            >
              <Settings className="w-4 h-4" /> Global Configs
            </button>
          </div>
        </div>

        {/* User identification avatar card bottom */}
        <div className="bg-white/80 border border-[#C6D6C4] p-3 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-700 font-bold text-sm tracking-wide font-serif">
            SU
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#1A301E] truncate leading-none">System Root</h4>
            <p className="text-[10px] text-[#4d614b] truncate mt-1">Platform General Dean</p>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN PANEL DISPLAY - NO SCROLL */}
      <main className="lg:col-span-9 p-8 flex flex-col gap-6 overflow-y-hidden">
        
        {/* TAB 1: USERS */}
        {activeTab === "users" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">User Authorizations Management Index</h2>
              <p className="text-xs text-neutral-500 mt-1">Audit security authorization levels, college credential profiles, and delete mock seed nodes inside dynamic memory.</p>
            </div>

            <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="bg-[#E3ECE1]/40 text-emerald-950 uppercase tracking-widest text-[9px] border-b border-neutral-300">
                    <th className="p-4 rounded-tl-xl font-bold font-mono">Registered Name</th>
                    <th className="p-4 font-bold font-mono">Authorization Role</th>
                    <th className="p-4 font-bold font-mono">College Verification State</th>
                    <th className="p-4 font-bold font-mono">Academic GPA</th>
                    <th className="p-4 rounded-tr-xl text-center font-bold font-mono">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans">
                  {students.map(std => (
                    <tr key={std.id} className="hover:bg-neutral-50/50 transition">
                      <td className="p-4 font-bold text-slate-800 font-serif">
                        {std.name}
                        <span className="block text-[10px] text-neutral-400 font-normal font-sans mt-0.5">{std.email}</span>
                      </td>
                      <td className="p-4">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono text-[10px] border border-emerald-100 font-medium">
                          Student Candidate
                        </span>
                      </td>
                      <td className="p-4">
                        {std.verificationStatus === "Verified" ? (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            College Approved
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            Unverified Profile
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800">
                        {std.academic?.cgpa || "N/A"}/10
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          {std.verificationStatus !== "Verified" && (
                            <button
                              onClick={() => onGrantVerification(std.id)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-[10px] transition"
                            >
                              Force Approve
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteStudent(std.id)}
                            className="p-1 px-2.5 bg-neutral-100 hover:bg-rose-100 text-neutral-400 hover:text-red-500 font-bold rounded border border-neutral-200/30 transition text-[10px]"
                            title="Purge user record"
                          >
                            Purge
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Root Reserve system nodes */}
                  <tr className="bg-neutral-50/20">
                    <td className="p-4 font-bold text-slate-800 font-serif">
                      Aravind S (Corporate Partner)
                      <span className="block text-[10px] text-neutral-400 font-normal font-sans mt-0.5 font-medium">aravind@amazon.co.in</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-mono text-[10px] border border-indigo-100 font-medium">
                        Recruiter Key
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        Corporate Approved
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-neutral-400">N/A</td>
                    <td className="p-4 text-center text-neutral-400 font-mono text-[10px]">RESERVED NODE</td>
                   </tr>

                  <tr className="bg-neutral-50/20">
                    <td className="p-4 font-bold text-slate-800 font-serif">
                      State College Admin
                      <span className="block text-[10px] text-neutral-400 font-normal font-sans mt-0.5 font-medium">dean@engineering.edu</span>
                     </td>
                    <td className="p-4">
                      <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-mono text-[10px] border border-rose-100 font-semibold">
                        Placement Lead
                      </span>
                     </td>
                    <td className="p-4">
                      <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        Dean Admin Authority
                      </span>
                     </td>
                    <td className="p-4 font-mono font-bold text-neutral-400">N/A</td>
                    <td className="p-4 text-center text-neutral-400 font-mono text-[10px]">RESERVED NODE</td>
                   </tr>
                </tbody>
               </table>
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM INFRASTRUCTURE MONITORS */}
        {activeTab === "monitors" && (
          <div className="bg-[#120F17] text-[#BFBFBF] p-6 rounded-2xl border border-neutral-800 shadow-xl flex flex-col gap-6 font-sans">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-neutral-800 pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-white tracking-wide">Live Infrastructure Microservices Dashboard</h2>
                <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-mono">Real-Time Core Container Metrics</p>
              </div>

              <button
                onClick={triggerRefreshSystemState}
                disabled={isRefreshingMonitor}
                className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-mono rounded-lg flex items-center gap-2 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMonitor ? 'animate-spin' : ''}`} /> Polling Core States
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono block mb-1">CPU Utilization</span>
                  <div className="text-3xl font-mono font-bold text-emerald-400">{simulatedLoad.cpu}%</div>
                </div>
                <div className="w-full bg-neutral-800 h-1 rounded overflow-hidden mt-3">
                  <div className="h-full bg-emerald-400" style={{ width: `${simulatedLoad.cpu}%` }} />
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono block mb-1 font-semibold">Allocated RAM</span>
                  <div className="text-3xl font-mono font-bold text-indigo-400">{simulatedLoad.memory} MB / <span className="text-xs text-neutral-500">1 GB</span></div>
                </div>
                <div className="w-full bg-neutral-800 h-1 rounded overflow-hidden mt-3">
                  <div className="h-full bg-indigo-400" style={{ width: `${(simulatedLoad.memory / 1000) * 100}%` }} />
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono block mb-1">Total API calls count</span>
                  <div className="text-3xl font-mono font-bold text-rose-400">{simulatedLoad.apiRequests} reqs</div>
                </div>
                <div className="w-full bg-neutral-800 h-1 rounded overflow-hidden mt-3">
                  <div className="h-full bg-rose-400" style={{ width: "65%" }} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-400">Platform Activity Logs (Stdout)</span>
              <div className="p-4 bg-black/90 font-mono text-[10px] leading-relaxed rounded-xl border border-neutral-800 text-zinc-300 max-h-[220px] overflow-y-auto flex flex-col-reverse gap-1.5">
                {logs.map((log, index) => (
                  <div key={index} className="hover:text-white transition-all cursor-default">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONFIGURATIONS */}
        {activeTab === "configurations" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6 font-sans">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">Dynamic Platform Security Configurations</h2>
              <p className="text-xs text-neutral-500 mt-1">Configure global platform cookies, clear active memory cache variables, or force initialize databases.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between items-start gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-emerald-600" /> Platform Storage Cookie Memory Cache</h4>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed font-sans">Empties all cached static files and resets active placement milestones back to standard seed defaults.</p>
                </div>
                <button
                  onClick={handleEvacuateSystemCache}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Truncate Cache & Evacuate Cookie
                </button>
              </div>

              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between items-start gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><Lock className="w-4 h-4 text-indigo-600" /> SSL Security Tunnel Handshake Verifier</h4>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed font-sans">Confirms active JWT verification and handles secure server ports for data routing.</p>
                </div>
                <span className="text-[10px] font-bold text-[#A5C89E] bg-[#E5EEE4] border border-[#A5C89E] px-2.5 py-1 rounded-full font-mono">
                  SSL GATEWAY ENFORCED
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}