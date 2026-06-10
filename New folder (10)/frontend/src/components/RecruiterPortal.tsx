import React, { useState } from "react";
import { 
  Plus, Trash2, Edit, User, Eye, Briefcase, FileCheck, CheckCircle2, 
  Sparkles, Award, ArrowUpRight, ShieldCheck, Cpu, Database, ChevronRight, X, LayoutDashboard
} from "lucide-react";
import { Job, StudentProfile, Application, MockInterviewResult } from "../types";
import BorderGlow from "./BorderGlow";
import ShimmerButton from "./ShimmerButton";
import rec from "@/images/rec.jpeg";
import ai_logo from "@/images/ai_logo.jpg";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

interface RecruiterPortalProps {
  jobs: Job[];
  applications: Application[];
  students: StudentProfile[];
  recruiterId: string;
  recruiterName: string;
  onCreateJob: (job: Job) => void;
  onUpdateJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onUpdateApplicationStatus: (appId: string, status: any) => void;
}

export default function RecruiterPortal({
  jobs,
  applications,
  students,
  recruiterId,
  recruiterName,
  onCreateJob,
  onUpdateJob,
  onDeleteJob,
  onUpdateApplicationStatus
}: any) {
  const [activeTab, setActiveTab] = useState<"job-list" | "applicants" | "rankings">("job-list");

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [location, setLocation] = useState("Bangalore (Onsite)");
  const [salary, setSalary] = useState("₹80,000 / Month");
  const [eligibility, setEligibility] = useState("8.0+ CGPA; B.Tech CSE/IT");
  const [deadline, setDeadline] = useState("2026-07-31");

  // AI Candidate ranking state
  const [rankingRoleId, setRankingRoleId] = useState<string>("job_1");
  const [rankingsList, setRankingsList] = useState<any[]>([]);
  const [isRanking, setIsRanking] = useState(false);

  // Resume inspect view
  const [inspectStudentResume, setInspectStudentResume] = useState<StudentProfile | null>(null);

  // Filter recruiter specific items
  const myJobs = jobs.filter((j: any) => j.recruiterId === recruiterId);
  const myApplications = applications.filter((app: any) => {
    const job = jobs.find((j: any) => j.id === app.jobId);
    return job && job.recruiterId === recruiterId;
  });

  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setSkillsStr(job.skills.join(", "));
    setLocation(job.location);
    setSalary(job.salary);
    setEligibility(job.eligibility);
    setDeadline(job.deadline);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingJob(null);
    setTitle("");
    setDescription("");
    setSkillsStr("");
  };

  const handleCreateOrUpdateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const skillsArr = skillsStr.split(",").map(s => s.trim()).filter(Boolean);

    if (editingJob) {
      const updated: Job = {
        ...editingJob,
        title,
        description,
        skills: skillsArr,
        location,
        salary,
        eligibility,
        deadline
      };
      onUpdateJob(updated);
    } else {
      const newJob: Job = {
        id: "job_" + Date.now(),
        recruiterId,
        recruiterName,
        title,
        description,
        skills: skillsArr,
        location,
        salary,
        eligibility,
        deadline,
        verificationStatus: "Pending"
      };
      onCreateJob(newJob);
    }
    handleCloseForm();
  };

  const handleAIRanking = async () => {
    const targetJob = jobs.find((j: any) => j.id === rankingRoleId);
    if (!targetJob) return;

    setIsRanking(true);
    setRankingsList([]);

    const relevantApplicantsApps = applications.filter((app: any) => app.jobId === rankingRoleId);
    const candidatePayloads = relevantApplicantsApps.map((app: any) => {
      const studentObj = students.find((s: any) => s.id === app.studentId);
      return {
        name: studentObj?.name || app.studentName,
        skills: studentObj?.skills || [],
        resumeScore: studentObj?.atsScore || 70,
        interviewScore: app.interviewScore || 75,
        verified: studentObj?.verificationStatus === "Verified",
        gpa: studentObj?.academic.cgpa || "N/A"
      };
    });

    if (candidatePayloads.length === 0) {
      setIsRanking(false);
      alert("No student has applied to this placement yet. Create mock applicants or apply as student first!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/ai/gemini/rank-candidates`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("placely_token")}`
        },
        body: JSON.stringify({
          jobTitle: targetJob.title,
          jobDescription: targetJob.description,
          candidates: candidatePayloads
        })
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setRankingsList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRanking(false);
    }
  };

  const selectedCandidatesCount = myApplications.filter((app: any) => app.status === "Selected").length;
  const activePostingsCount = myJobs.length;

  return (
    <div className="bg-[#F7F6EE] text-[#2C3E2B] rounded-3xl overflow-hidden border border-neutral-300/40 shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[750px] overflow-y-hidden">
      
      {/* LEFT PERSISTENT SIDEBAR - Talent Recruiter Slate */}
      <aside className="lg:col-span-3 bg-[#E3ECE1] border-r border-[#D4DFD2] p-6 flex flex-col justify-between overflow-y-hidden">
        <div className="flex flex-col gap-8">
          
          {/* Logo brand label */}
          <div className="flex items-center gap-3">
                          <img className="w-10 h-10 rounded-xl" src={rec} />

            <div>
              <h2 className="font-serif text-lg font-black tracking-tight text-[#1A301E] leading-none">RecruitAI</h2>
              <span className="text-[9px] font-mono tracking-wider text-emerald-800 uppercase font-semibold mt-1 block">Talent Center</span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono tracking-widest font-bold text-emerald-900/60 uppercase block mb-2.5">Talent Portal</span>
            <button
              onClick={() => setActiveTab("job-list")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "job-list" 
                ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Active Postings
            </button>
            <button
              onClick={() => setActiveTab("applicants")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "applicants" 
                ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
              }`}
            >
              <FileCheck className="w-4 h-4" /> Applicants
            </button>
            <button
              onClick={() => setActiveTab("rankings")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "rankings" 
                ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
              }`}
            >
              <Sparkles className="w-4 h-4" /> AI rankings
            </button>
          </div>
        </div>

        {/* Recruiter active details bottom */}
        <div className="bg-white/80 border border-[#C6D6C4] p-3 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-800 font-bold text-sm tracking-wide font-serif">
            {recruiterName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#1A301E] truncate leading-none">{recruiterName}</h4>
            <p className="text-[10px] text-[#4d614b] truncate mt-1">Enterprise Talent Manager</p>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN PANEL DISPLAY - NO SCROLL */}
      <main className="lg:col-span-9 p-8 flex flex-col gap-6 overflow-y-hidden">
        
        {/* UPPER BANNER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/40 pb-4">
          <div>
            <h1 className="font-serif text-3xl font-black text-slate-750">Campus Recruitment HQ</h1>
            <p className="text-xs text-neutral-500 mt-1">Draft active placement requirements and let dynamic AI algorithms rank your talent flow.</p>
          </div>

          <div className="flex gap-2">
            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] font-mono text-emerald-800 block">SELECTED</span>
              <span className="font-bold text-slate-800 text-sm">{selectedCandidatesCount} Offer Sent</span>
            </div>
            <div className="bg-[#FFFDE8] border border-amber-200 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] font-mono text-amber-800 block font-medium">Vacancies</span>
              <span className="font-bold text-slate-800 text-sm">{activePostingsCount} Requirements</span>
            </div>
          </div>
        </div>

        {/* TAB 1: JOB LIST */}
        {activeTab === "job-list" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-neutral-300/30">
              <h2 className="font-serif text-md font-bold text-slate-800">Your Corporate Postings</h2>
         <ShimmerButton
  onClick={() => {
    setShowAddForm(true);
    setEditingJob(null);
  }}
  background="linear-gradient(135deg, #1C352D 0%, #304E3F 100%)"
  className="
    px-4 py-2.5
    text-white
    rounded-xl
    text-xs
    font-bold
    transition
    flex items-center gap-2
    shadow-xs
  "
>
  <Plus className="w-4 h-4" />
  Draft New Drive Requirement
</ShimmerButton>
            </div>

            {/* Job Form overlay or expanding */}
            {showAddForm && (
              <form onSubmit={handleCreateOrUpdateJob} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-md flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <h3 className="font-serif text-md font-bold text-slate-800">{editingJob ? "Configure Vacancy Posting" : "Initiate Placement Requirement Draft"}</h3>
                  <button type="button" onClick={handleCloseForm} className="text-neutral-400 hover:text-neutral-700 font-bold text-lg">×</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Corporate Role Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Associate Backend Specialist"
                      className="w-full text-xs border border-neutral-200 p-3 rounded-lg text-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Target Skill Stack (Comma Separated)</label>
                    <input
                      type="text"
                      value={skillsStr}
                      onChange={e => setSkillsStr(e.target.value)}
                      placeholder="e.g. Java, Docker, PostgreSQL"
                      className="w-full text-xs border border-neutral-200 p-3 rounded-lg text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">Full Candidate Description & Critical Outcomes</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Provide goals, metrics, and technologies used..."
                    className="w-full text-xs border border-neutral-200 p-3 rounded-lg text-slate-600 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-xs font-semibold text-[#4A5568] block mb-1">Office Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-lg text-slate-700" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A5568] block mb-1">Pay Package/Month</label>
                    <input type="text" value={salary} onChange={e => setSalary(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-lg text-slate-700" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A5568] block mb-1">Eligibility Criteria</label>
                    <input type="text" value={eligibility} onChange={e => setEligibility(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-lg text-slate-700" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A5568] block mb-1">Application Deadline</label>
                    <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-lg text-slate-700" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                  <button type="button" onClick={handleCloseForm} className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-semibold">Discard</button>
                  <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm">Save Placement Post</button>
                </div>
              </form>
            )}

            {/* List of roles - with max height and no scroll */}
            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto">
              {myJobs.map((job: any) => (
                <div key={job.id} className="bg-white rounded-2xl p-6 border border-neutral-200/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-neutral-300 transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full border ${
                        job.verificationStatus === "Approved" 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                        : job.verificationStatus === "Rejected"
                        ? "bg-red-50 text-red-800 border-red-100"
                        : "bg-amber-50 text-amber-800 border-amber-100"
                      }`}>
                        {job.verificationStatus === "Approved" ? "● Visible To Students" : job.verificationStatus === "Rejected" ? "⚠️ Needs Officer Redraft" : "● Verifying by College"}
                      </span>
                      {job.verificationRemarks && <span className="text-[10px] text-red-500 font-bold ml-1">Reason: {job.verificationRemarks}</span>}
                    </div>

                    <h3 className="text-sm md:text-md text-slate-800 font-serif font-bold">{job.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed font-sans">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills.map((s: string, idx: number) => (
                        <span key={idx} className="bg-neutral-100 text-[10px] py-1 px-2.5 rounded font-medium text-slate-700">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 self-end md:self-auto shrink-0">
                    <button
                      onClick={() => handleOpenEdit(job)}
                      className="p-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-600 hover:text-slate-800 transition"
                      title="Edit Vacancy"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteJob(job.id)}
                      className="p-2 bg-neutral-50 hover:bg-red-50 border border-neutral-200 hover:border-red-200 rounded-lg text-neutral-400 hover:text-red-600 transition"
                      title="Delete Posting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {myJobs.length === 0 && (
                <div className="text-center p-12 bg-white rounded-2xl border border-neutral-200 font-serif text-neutral-400">
                  No vacancies drafted under your talent corporate key yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: APPLICANTS - with table wrapper and no scroll */}
     {activeTab === "applicants" && (
  <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6">

    <div>
      <h2 className="font-serif text-lg font-bold text-slate-750">
        Job Applicant Administration Deck
      </h2>
      <p className="text-xs text-neutral-500 mt-1">
        Review student applications, analyze matching metrics, verify profiles, and assign specialized AI Technical / behavioral rounds.
      </p>
    </div>

    {/* ❌ removed overflow-x-auto */}
    <div className="overflow-y-auto max-h-[550px]">
      <table className="w-full text-xs text-left border-collapse">

        <thead className="sticky top-0 bg-[#E3ECE1]/40 z-10">
          <tr className="bg-[#E3ECE1]/40 text-emerald-900 uppercase tracking-widest text-[9px] border-b border-neutral-300">

            <th className="p-4 rounded-tl-xl font-bold font-mono">Student Candidate</th>
            <th className="p-4 font-mono font-bold">Applied Placement</th>
            <th className="p-4 font-mono font-bold">ATS Fit Rate</th>
            <th className="p-4 font-mono font-bold">Mock Status</th>
            <th className="p-4 font-mono font-bold">College State</th>
            <th className="p-4 font-mono font-bold">Current Workflow Stage</th>
            <th className="p-4 rounded-tr-xl text-center font-mono font-bold">
              Interactive Actions
            </th>

          </tr>
        </thead>

        <tbody className="divide-y divide-neutral-100">

          {myApplications.map((app: any) => {
            const studentObj = students.find((s: any) => s.id === app.studentId);
            const targetJob = jobs.find((j: any) => j.id === app.jobId);

            return (
              <tr key={app.id} className="hover:bg-neutral-50/50 transition">

                <td className="p-4 font-bold text-slate-800">
                  {app.studentName}
                  <span className="block text-[10px] text-neutral-400 font-normal mt-0.5">
                    {studentObj?.email}
                  </span>
                </td>

                <td className="p-4 text-slate-600 font-serif">
                  {targetJob?.title || "Corporate Vacancy"}
                </td>

                <td className="p-4 font-mono font-bold text-emerald-700">
                  {studentObj?.atsScore ? `${studentObj.atsScore}%` : "Not Screened"}
                </td>

                <td className="p-4">
                  {app.interviewScore ? (
                    <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-100 font-mono">
                      Verified Score: {app.interviewScore}%
                    </span>
                  ) : app.status === "MockAssigned" ? (
                    <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                      Mock Pending
                    </span>
                  ) : (
                    <span className="text-neutral-400 font-mono">
                      Not Assigned
                    </span>
                  )}
                </td>

                <td className="p-4 font-serif">
                  {studentObj?.verificationStatus === "Verified" ? (
                    <span className="bg-emerald-50 text-emerald-700 py-0.5 px-2 rounded-full font-semibold border border-emerald-200">
                      Verified
                    </span>
                  ) : (
                    <span className="bg-amber-50 text-amber-700 py-0.5 px-2 rounded-full font-semibold border border-amber-200">
                      Pending College
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                    app.status === "Selected"
                      ? "bg-emerald-100 text-emerald-800"
                      : app.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : app.status === "Shortlisted"
                      ? "bg-[#FFFDE8] text-amber-800 border border-amber-200"
                      : "bg-neutral-100 text-neutral-600"
                  }`}>
                    {app.status}
                  </span>
                </td>

                {/* ✅ ACTION BUTTONS (HEIGHT FIXED, SAME ALIGNMENT) */}
                <td className="p-4">
                  <div className="flex gap-1.5 justify-center">

                    <button
                      onClick={() => {
                        if (studentObj) {
                          setInspectStudentResume(studentObj);
                        } else {
                          alert("Candidate data is currently unpopulated.");
                        }
                      }}
                      className="px-2 py-0.5 bg-[#E1EFE0]/60 hover:bg-emerald-100 border border-neutral-200 rounded text-sky-950 font-semibold transition flex items-center gap-1 text-[10px]"
                    >
                      <Eye className="w-3 h-3" />
                      Resume
                    </button>

                    {app.status !== "Selected" && app.status !== "Rejected" && (
                      <button
                        onClick={() => onUpdateApplicationStatus(app.id, "MockAssigned")}
                        className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-indigo-700 font-semibold transition text-[10px]"
                      >
                        Trigger Mock
                      </button>
                    )}

                    {app.status === "Applied" && (
                      <button
                        onClick={() => onUpdateApplicationStatus(app.id, "Shortlisted")}
                        className="px-2 py-0.5 bg-[#FFFDE8] hover:bg-amber-100 border border-amber-200 rounded text-amber-800 font-semibold transition text-[10px]"
                      >
                        Shortlist
                      </button>
                    )}

                    {app.status !== "Selected" && app.status !== "Rejected" && (
                      <>
                        <button
                          onClick={() => onUpdateApplicationStatus(app.id, "Selected")}
                          className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold transition text-[10px]"
                        >
                          Select
                        </button>

                        <button
                          onClick={() => onUpdateApplicationStatus(app.id, "Rejected")}
                          className="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 rounded font-bold transition text-[10px]"
                        >
                          Reject
                        </button>
                      </>
                    )}

                  </div>
                </td>

              </tr>
            );
          })}

          {myApplications.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center p-8 text-neutral-400 font-serif">
                No active student has registered applications yet.
              </td>
            </tr>
          )}

        </tbody>
      </table>
    </div>
  </div>
)}

        {/* TAB 3: RANKINGS */}
        {activeTab === "rankings" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6 font-sans">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2">
                <img className="w-10 h-10 text-indigo-750" src={ai_logo} /> AI-Powered Candidate Ranking
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Trigger Gemini reasoning pipelines to rank submitted student profiles based on cumulative ATS Scores, custom Skills relevance, and Mock Interview evaluations.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-50 p-4 border border-neutral-200 rounded-2xl">
              <div className="flex-1 w-full">
                <label className="text-xs font-bold text-neutral-600 block mb-1">Target Hiring Vacancy</label>
                <select
                  value={rankingRoleId}
                  onChange={e => setRankingRoleId(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-200 p-2.5 rounded-xl cursor-pointer"
                >
                  {myJobs.map((j: any) => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              </div>

              <ShimmerButton
                onClick={handleAIRanking}
                disabled={isRanking || myJobs.length === 0}
                 background="linear-gradient(135deg, #1C352D 0%, #304E3F 100%)"
  className="
  mt-5
    px-4 py-2.5
    text-white
    rounded-xl
    text-xs
    font-bold
    transition
    flex items-center gap-2
    shadow-xs
  "
              >
                {isRanking ? (
                  <span className="flex items-center gap-1.5 bg-transparent">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Evaluating Merit lists...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-transparent">
                    Evaluate & Rank Applicants
                  </span>
                )}
              </ShimmerButton>
            </div>

            {/* rankings outputs - with max height and scroll inside only if needed */}
            <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto">
              {rankingsList.map((c: any, idx: number) => (
                <div key={idx} className="p-5 bg-neutral-50/50 border border-neutral-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 hover:bg-neutral-50 transition border-l-4 border-l-indigo-500">
                  <div className="flex items-start gap-4 w-full">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-bold font-serif text-indigo-800 shrink-0 border border-indigo-100">
                      #{c.rank}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        {c.name}
                        <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold border border-emerald-100 py-0.5 px-2 rounded-full font-mono">
                          {c.matchScore}% Match Fit
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-500 mt-1 leading-relaxed font-sans">{c.keyReason}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {c.recommendedRoles?.map((role: string, rIdx: number) => (
                          <span key={rIdx} className="bg-indigo-50 text-[10px] py-0.5 px-2 rounded text-indigo-700 font-medium font-mono">{role}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center bg-white border border-neutral-200 p-3 rounded-xl self-end md:self-auto font-mono text-[10px] uppercase font-bold text-slate-800">
                    <span>Priority Recommendation Match</span>
                  </div>
                </div>
              ))}

              {rankingsList.length === 0 && !isRanking && (
                <div className="text-center p-8 border border-neutral-200 text-neutral-400 text-xs font-serif rounded-xl">
                  Configure your target vacancy and run Gemini comparative evaluation to populate rankings dynamically.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL WINDOWS - Resume Inspector */}
      {inspectStudentResume && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] border border-neutral-300 p-6 shadow-2xl flex flex-col gap-4 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3 sticky top-0 bg-white">
              <h3 className="font-serif text-sm font-bold text-[#1A301E]">Qualifications Inspection Dossier</h3>
              <button onClick={() => setInspectStudentResume(null)} className="p-1 px-1.5 hover:bg-neutral-100 rounded text-neutral-500 font-bold">×</button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#2D3748] mb-1">{inspectStudentResume.name}</h4>
              <p className="text-[10px] text-neutral-400 mb-4">{inspectStudentResume.email} | {inspectStudentResume.phone}</p>
              
              <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2 font-mono">Academic Index</h5>
              <p className="text-xs text-slate-800 font-serif">{inspectStudentResume.academic?.degree} in {inspectStudentResume.academic?.major}, graduating {inspectStudentResume.academic?.graduationYear}. Verified Cumulative CGPA: <strong>{inspectStudentResume.academic?.cgpa}/10</strong></p>

              <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2 mt-4 font-mono">Verified Skill Inventory</h5>
              <div className="flex flex-wrap gap-1 mb-4">
                {inspectStudentResume.skills?.map((s: string, idx: number) => (
                  <span key={idx} className="bg-[#E3ECE1] text-slate-700 text-[10px] font-medium py-1 px-2.5 rounded-md border border-neutral-200">{s}</span>
                ))}
              </div>

              <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2 font-mono">Raw Portfolio Phrasings</h5>
              <pre className="text-[11px] font-mono leading-relaxed bg-neutral-50 text-neutral-700 p-4 border border-neutral-200 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-[220px]">
                {inspectStudentResume.resumeText || "No text-based copy has been uploaded on record."}
              </pre>
            </div>

            <button
              onClick={() => setInspectStudentResume(null)}
              className="w-full mt-2 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Close Inspect Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}