import React, { useState } from "react";
import { 
  Check, X, AlertTriangle, Calendar, Plus, Trash2, Award, 
  MapPin, GraduationCap, Building2, Eye, UserCheck, BarChart3, TrendingUp, HelpCircle, LayoutDashboard
} from "lucide-react";
import { StudentProfile, Job, PlacementDrive } from "../types";
import BorderGlow from "./BorderGlow";
import ShimmerButton from "./ShimmerButton";


interface PlacementOfficerPortalProps {
  students: StudentProfile[];
  jobs: Job[];
  drives: PlacementDrive[];
  onVerifyStudent: (studentId: string, status: "Verified" | "Rejected", remarks?: string) => void;
  onVerifyJob: (jobId: string, status: "Approved" | "Rejected", remarks?: string) => void;
  onAddDrive: (drive: PlacementDrive) => void;
  onDeleteDrive: (driveId: string) => void;
}

export default function PlacementOfficerPortal({
  students,
  jobs,
  drives,
  onVerifyStudent,
  onVerifyJob,
  onAddDrive,
  onDeleteDrive
}: PlacementOfficerPortalProps) {
  const [activeTab, setActiveTab] = useState<"verifications" | "jobs-ver" | "drives" | "analytics">("verifications");

  // Drive scheduling forms
  const [showAddDrive, setShowAddDrive] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [startDate, setStartDate] = useState("2026-06-30");
  const [eligibleCourses, setEligibleCourses] = useState("B.Tech CSE/IT");
  const [cgpaCutoff, setCgpaCutoff] = useState("8.0");
  const [location, setLocation] = useState("Campus Auditorium");

  // Inspect student resume or verify remarks modal
  const [inspectStudent, setInspectStudent] = useState<StudentProfile | null>(null);

  const pendingStudents = students.filter(s => s.verificationStatus === "Pending");
  const pendingJobs = jobs.filter(j => j.verificationStatus === "Pending");

  const handleSubmitDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    const newDrive: PlacementDrive = {
      id: "drive_" + Date.now(),
      companyName,
      startDate,
      eligibleCourses: eligibleCourses.split(",").map(c => c.trim()),
      cgpaCutoff: parseFloat(cgpaCutoff) || 7.0,
      registeredCount: 0,
      status: "Upcoming",
      location
    };
    onAddDrive(newDrive);

    // Reset
    setShowAddDrive(false);
    setCompanyName("");
  };

  return (
    <div className="bg-[#F7F6EE] text-[#2C3E2B] rounded-3xl overflow-hidden border border-neutral-300/40 shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[750px] overflow-y-hidden">
      
      {/* LEFT PERSISTENT SIDEBAR - Officer Control Theme */}
      <aside className="lg:col-span-3 bg-[#E3ECE1] border-r border-[#D4DFD2] p-6 flex flex-col justify-between overflow-y-hidden">
        <div className="flex flex-col gap-8">
          
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#A0C595] text-[#1A301E] rounded-xl flex items-center justify-center font-bold shadow-[0_4px_10px_rgba(160,197,149,0.3)]">
              <UserCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-black tracking-tight text-[#1A301E] leading-none">OfficerAI</h2>
              <span className="text-[9px] font-mono tracking-wider text-emerald-800 uppercase font-semibold mt-1 block">Campus Secretary</span>
            </div>
          </div>

          {/* Action List Tabs matching StudentPortal */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono tracking-widest font-bold text-emerald-900/60 uppercase block mb-2.5">Verification & Auditing</span>
            <button
              onClick={() => setActiveTab("verifications")}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "verifications" 
                ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
              }`}
            >
              <span className="flex items-center gap-3">
                <UserCheck className="w-4 h-4" /> Students Ver.
              </span>
              {pendingStudents.length > 0 && (
                <span className="bg-amber-600 text-white rounded-full text-[9px] px-1.5 py-0.2 font-mono">{pendingStudents.length}</span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab("jobs-ver")}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "jobs-ver" 
                ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
              }`}
            >
              <span className="flex items-center gap-3">
                <Building2 className="w-4 h-4" /> Company Jobs
              </span>
              {pendingJobs.length > 0 && (
                <span className="bg-rose-600 text-white rounded-full text-[9px] px-1.5 py-0.2 font-mono">{pendingJobs.length}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("drives")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "drives" 
                ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
              }`}
            >
              <Calendar className="w-4 h-4" /> Drive Scheduler
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "analytics" 
                ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Drive Insights
            </button>
          </div>
        </div>

        {/* Dynamic credential profile indicator */}
        <div className="bg-white/80 border border-[#C6D6C4] p-3 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-800 font-bold text-sm font-serif">
            PO
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#1A301E] truncate leading-none">Placement Desk</h4>
            <p className="text-[10px] text-[#4d614b] truncate mt-1">State University Auditor</p>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN PANEL DISPLAY - NO SCROLL */}
      <main className="lg:col-span-9 p-8 flex flex-col gap-6 overflow-y-hidden">
        
        {/* TAB 1: VERIFICATIONS */}
        {activeTab === "verifications" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-750">Student Profile Credentials Audit</h2>
              <p className="text-xs text-neutral-500 mt-1">Review candidate files in the university databases. Endorse student profiles so they are allowed to register for upcoming corporate recruitment initiatives.</p>
            </div>

            <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 bg-[#E3ECE1]/40 z-10">
                  <tr className="bg-[#E3ECE1]/40 text-emerald-950 uppercase tracking-widest text-[9px] border-b border-neutral-300">
                    <th className="p-4 rounded-tl-xl font-bold font-mono">Inquirer Candidate</th>
                    <th className="p-4 font-bold font-mono">Academic stream</th>
                    <th className="p-4 font-bold font-mono">Cumulative CGPA</th>
                    <th className="p-4 font-bold font-mono">ATS readiness Score</th>
                    <th className="p-4 text-center rounded-tr-xl font-bold font-mono">Verification Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {students.map(s => {
                    const isPending = s.verificationStatus === "Pending";
                    return (
                      <tr key={s.id} className="hover:bg-neutral-50/50 transition">
                        <td className="p-4 font-bold text-slate-800 font-serif">
                          {s.name}
                          <span className="block text-[10px] text-neutral-400 font-normal font-sans mt-0.5">{s.email}</span>
                        </td>
                        <td className="p-4 text-neutral-600 font-serif">
                          {s.academic.degree} in {s.academic.major}
                          <span className="block text-[9px] text-[#4d614b] font-mono mt-0.5">Y.O.G: {s.academic.graduationYear}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-700">
                          {s.academic.cgpa}/10.0
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 py-0.5 px-2 rounded">
                            {s.atsScore || 70}% Ready
                          </span>
                        </td>
                        <td className="p-4">
                        <div className="flex gap-1 justify-center items-center">

  {/* View */}
  <button
    onClick={() => setInspectStudent(s)}
    className="
      flex items-center gap-1
      h-7 px-2
      bg-neutral-100 hover:bg-neutral-200
      border border-neutral-300
      rounded-md
      text-[10px] text-slate-700
      leading-none
      transition
    "
  >
    <Eye className="w-3 h-3" />
    View
  </button>

  {isPending ? (
    <>
      {/* Approve */}
      <button
        onClick={() => onVerifyStudent(s.id, "Verified")}
        className="
          h-7 px-2
          bg-emerald-700 hover:bg-emerald-800
          text-white
          rounded-md
          text-[10px]
          leading-none
          font-semibold
          transition
        "
      >
        Approve
      </button>

      {/* Reject */}
      <button
        onClick={() => {
          const notes = prompt("Enter student redraft instructions feedback:");
          if (notes) onVerifyStudent(s.id, "Rejected", notes);
        }}
        className="
          h-7 px-2
          bg-red-100 hover:bg-red-200
          text-red-700
          border border-red-200
          rounded-md
          text-[10px]
          leading-none
          font-semibold
          transition
        "
      >
        Request
      </button>
    </>
  ) : (
    <span
      className={`
        h-7 px-2
        flex items-center
        text-[10px] font-bold
        rounded-md border
        ${
          s.verificationStatus === "Verified"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-neutral-50 text-neutral-400"
        }
      `}
    >
      {s.verificationStatus}
    </span>
  )}

</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: JOBS-VER */}
        {activeTab === "jobs-ver" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">Corporate Job Requirements Validation</h2>
              <p className="text-xs text-neutral-500 mt-1">Ensure submitted recruiter requirements are authentic and consistent with academic eligibility standards before publishing.</p>
            </div>

            <div className="space-y-4 max-h-[550px] overflow-y-auto">
              {jobs.map(job => {
                const isPending = job.verificationStatus === "Pending";
                return (
                  <div key={job.id} className="p-4 border border-neutral-200 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4 bg-neutral-50/25">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] bg-indigo-50 border border-indigo-250 text-indigo-800 font-bold px-2 py-0.5 rounded font-mono">
                          {job.recruiterName}
                        </span>
                        <span className="text-[10px] text-neutral-500">Eligibility Cutoff: {job.eligibility}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#1A301E] font-serif">{job.title} ({job.location})</h4>
                      <p className="text-[11px] text-neutral-500 mt-1 max-w-2xl line-clamp-2 leading-relaxed">{job.description}</p>
                    </div>

                    <div className="flex gap-2 shrink-0 self-end md:self-auto">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => onVerifyJob(job.id, "Approved")}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition"
                          >
                            Approve Posting
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt("Enter feedback notes for recruiter redraft:");
                              if (notes) onVerifyJob(job.id, "Rejected", notes);
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold py-1.5 px-3 rounded-lg transition"
                          >
                            Reject Requirements
                          </button>
                        </>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          job.verificationStatus === "Approved" 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                          : "bg-red-50 border-red-200 text-red-800"
                        }`}>
                          {job.verificationStatus === "Approved" ? "Published" : "Rejected"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SCHEDULER DRIVES */}
        {activeTab === "drives" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6 font-sans">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-slate-750 text-left">Campus Placement Drive Schedules</h2>
                <p className="text-xs text-neutral-500 mt-1">Publish institutional milestones on the public planner list.</p>
              </div>

            <ShimmerButton
  onClick={() => setShowAddDrive(!showAddDrive)}
  background="linear-gradient(135deg, #1C352D 0%, #304E3F 100%)"
  className="
    px-4 py-2
    text-white
    
    text-xs
    font-bold
    transition
    flex items-center gap-1.5
  "
>
  <Plus className="w-4 h-4" />
  Schedule New Drive Event
</ShimmerButton>
            </div>

            {showAddDrive && (
              <form onSubmit={handleSubmitDrive} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-800 font-serif">Configure Event Metrics</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 block mb-1">Company Host Name</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Google India" className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg text-slate-700 font-sans" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 block mb-1">Event Commencement Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg text-slate-700 font-sans" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 block mb-1">Eligible Majors (Comma Separated)</label>
                    <input type="text" value={eligibleCourses} onChange={e => setEligibleCourses(e.target.value)} className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg text-slate-700 font-sans" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 block mb-1">Required Min. CGPA Cutoff</label>
                    <input type="text" value={cgpaCutoff} onChange={e => setCgpaCutoff(e.target.value)} className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg text-slate-700 font-sans" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-500 block mb-1">Event Venue Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg text-slate-700 font-sans" />
                  </div>
                </div>

                <button type="submit" className="self-end px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition mt-2 shadow-2xs">
                  Publish Drive to Calendar
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 gap-4 max-h-[450px] overflow-y-auto">
              {drives.map(drive => (
                <div key={drive.id} className="p-4 border border-neutral-200 rounded-2xl flex justify-between items-center bg-neutral-50/20 hover:bg-neutral-50/55 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-sm font-bold text-slate-800">{drive.companyName}</span>
                      <span className="text-[10px] bg-emerald-50 border border-emerald-100/50 text-emerald-800 font-bold py-0.5 px-2 rounded-md font-mono">
                        Cutoff: {drive.cgpaCutoff}+
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono block">COMMENCES: {drive.startDate} · Venue: {drive.location}</span>
                    <span className="text-[10px] text-neutral-500 block">Eligible Majors: {drive.eligibleCourses.join(", ")}</span>
                  </div>

                  <button
                    onClick={() => onDeleteDrive(drive.id)}
                    className="p-1.5 bg-neutral-100 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VISUAL ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6 font-sans">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">Visual Drive Analytics Performance</h2>
              <p className="text-xs text-neutral-500 mt-1">Comprehensive index matching campus metrics, verified applicant counts, and corporate performance scores.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50/50 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-800 font-mono block">STUDENT PLACEMENT PROGRESS FUNNEL</h4>
                
                <div className="flex flex-col gap-4 pt-2">
                  <div>
                    <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                      <span>Total Active Enrolled Batches</span>
                      <strong className="font-mono text-slate-700">120 Students</strong>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-200/60 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-800 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-800 mb-1">
                      <span>Certified verified by College Office</span>
                      <strong className="font-mono text-[#2D3748]">85 Candidates</strong>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-200/60 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A5C89E] rounded-full" style={{ width: "70.8%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                      <span>Placed / Corporate Offers Locked</span>
                      <strong className="font-mono text-[#2D3748]">42 Students</strong>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-200/60 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-700 rounded-full" style={{ width: "35%" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50/50 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-800 font-mono block">VISITING CORPORATE STATS SUMMARY</h4>
                
                <div className="flex-1 flex flex-col justify-around gap-3 pt-1">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-20 truncate text-neutral-500">Google Drive:</span>
                    <div className="flex-1 h-6 bg-indigo-50 border border-indigo-100 rounded-md relative overflow-hidden flex items-center pl-2 text-[10px] text-indigo-900 font-bold">
                      <div className="absolute inset-0 bg-indigo-200/40" style={{ width: "85%" }} />
                      <span className="relative">85 Candidates Checked</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-20 truncate text-neutral-500">Microsoft Co:</span>
                    <div className="flex-1 h-6 bg-rose-50 border border-rose-100 rounded-md relative overflow-hidden flex items-center pl-2 text-[10px] text-rose-950 font-bold">
                      <div className="absolute inset-0 bg-rose-200/40" style={{ width: "65%" }} />
                      <span className="relative">65 Candidates Screened</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-20 truncate text-neutral-500">Infosys Drive:</span>
                    <div className="flex-1 h-6 bg-emerald-50 border border-emerald-100 rounded-md relative overflow-hidden flex items-center pl-2 text-[10px] text-emerald-950 font-bold">
                      <div className="absolute inset-0 bg-emerald-200/40" style={{ width: "95%" }} />
                      <span className="relative">192 Candidates RSVped</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#E5EEE4] p-5 rounded-2xl border border-[#A5C89E]/40 flex flex-col md:flex-row items-center justify-between gap-5 mt-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-emerald-800 shrink-0" />
                <div className="text-slate-800">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900">Placement Target Achievement Index</h4>
                  <p className="text-xs text-emerald-850 mt-1 font-sans">Average candidate resume compatibility score has increased by **12.4%** following recursive AI Analyzer feedback loops.</p>
                </div>
              </div>
              <span className="font-serif text-3xl font-bold text-emerald-950 shrink-0">86.2% Placed</span>
            </div>
          </div>
        )}
      </main>

      {/* MODALS - Resume Inspector */}
      {inspectStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] border border-neutral-300 p-6 shadow-2xl flex flex-col gap-4 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3 sticky top-0 bg-white">
              <h3 className="font-serif text-sm font-bold text-emerald-800">Audit Student Profile Verification Panel</h3>
              <button onClick={() => setInspectStudent(null)} className="p-1 px-1.5 hover:bg-neutral-100 rounded text-neutral-500 font-bold">×</button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#2D3748] mb-1">{inspectStudent.name}</h4>
              <p className="text-[10px] text-neutral-400 mb-4">{inspectStudent.email} | {inspectStudent.phone}</p>
              
              <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2 font-mono">Qualifications Index</h5>
              <p className="text-xs text-slate-800 font-serif">Target Degree: <strong>{inspectStudent.academic?.degree} in {inspectStudent.academic?.major}</strong>, graduating {inspectStudent.academic?.graduationYear}. Verified Cumulative CGPA: <strong>{inspectStudent.academic?.cgpa}/10</strong></p>

              <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2 mt-4 font-mono">Verified Skill Inventory</h5>
              <div className="flex flex-wrap gap-1 mb-4">
                {inspectStudent.skills?.map((s, idx) => (
                  <span key={idx} className="bg-neutral-100 text-[10px] font-medium py-1 px-2 rounded">{s}</span>
                ))}
              </div>

              <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2 font-mono">Portfolio Projects</h5>
              <div className="grid grid-cols-1 gap-2.5 mb-4">
                {inspectStudent.projects?.map((prj, prjIdx) => (
                  <div key={prjIdx} className="bg-neutral-50/50 p-3 rounded-xl border border-neutral-200 text-xs">
                    <span className="font-bold block text-slate-800">{prj.name} <span className="font-mono text-[9px] bg-[#E3ECE1] border py-0.5 px-1.5 rounded ml-1.5">{prj.tech}</span></span>
                    <p className="text-[11px] text-neutral-500 mt-1">{prj.desc}</p>
                  </div>
                ))}
              </div>

              <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2 font-mono">Custom Audit Phrasings</h5>
              <pre className="text-[11px] font-mono leading-relaxed bg-neutral-50 text-neutral-700 p-4 border border-neutral-200 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-[200px]">
                {inspectStudent.resumeText || "No text-based copy has been uploaded on record."}
              </pre>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onVerifyStudent(inspectStudent.id, "Verified");
                  setInspectStudent(null);
                }}
                className="flex-1 py-3 bg-[#A5C89E] hover:bg-[#9CAB84] text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                Verify Profile Approved
              </button>
              <button
                onClick={() => {
                  const note = prompt("Enter verification feedback / modifications requested:");
                  if (note) {
                    onVerifyStudent(inspectStudent.id, "Rejected", note);
                    setInspectStudent(null);
                  }
                }}
                className="flex-1 py-3 bg-red-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition"
              >
                Request Profile Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}