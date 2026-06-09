import React, { useState, useEffect } from "react";
import { 
  User, BookOpen, Brain, MessageSquare, Briefcase, FileCheck, CheckCircle2, 
  Plus, Trash2, Send, Play, Sparkles, Award, ArrowUpRight, Check, X, HelpCircle, FileText,
  BarChart2, Bell, Settings as SettingsIcon, LayoutDashboard, Search, ChevronRight, Sparkle
} from "lucide-react";
import { StudentProfile, Job, Application, MockInterviewResult, ChatMessage } from "../types";
import BorderGlow from "./BorderGlow";
import ShimmerButton from "./ShimmerButton";

interface StudentPortalProps {
  profile: StudentProfile;
  jobs: Job[];
  applications: Application[];
  mockInterviews: MockInterviewResult[];
  onUpdateProfile: (updated: StudentProfile) => void;
  onApplyJob: (jobId: string) => void;
  onSaveMockResult: (result: MockInterviewResult) => void;
  onRequestVerification?: () => void | Promise<void>;
}

export default function StudentPortal({
  profile,
  jobs,
  applications,
  mockInterviews,
  onUpdateProfile,
  onApplyJob,
  onSaveMockResult,
  onRequestVerification
}: StudentPortalProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "profile" | "resume-analyzer" | "interview" | "chatbot" | "jobs" | "applications" | "analytics" | "notifications" | "settings"
  >("dashboard");

  // Profile forms
  const [editingName, setEditingName] = useState(profile.name);
  const [editingPhone, setEditingPhone] = useState(profile.phone);
  const [editingLinkedin, setEditingLinkedin] = useState(profile.linkedin);
  const [editingGithub, setEditingGithub] = useState(profile.github);
  const [editingSkill, setEditingSkill] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>(profile.skills);
  const [degree, setDegree] = useState(profile.academic.degree);
  const [major, setMajor] = useState(profile.academic.major);
  const [graduationYear, setGraduationYear] = useState(profile.academic.graduationYear);
  const [cgpa, setCgpa] = useState(profile.academic.cgpa);
  
  // Custom project adder
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectTech, setProjectTech] = useState("");
  const [projectsList, setProjectsList] = useState(profile.projects);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Resume analysis state
  const [resumeTextInput, setResumeTextInput] = useState(profile.resumeText || "");
  const [targetJobRole, setTargetJobRole] = useState("React Front-End Developer Intern");
  const [targetJobDesc, setTargetJobDesc] = useState("Required hands-on training with React, vanilla Javascript, state hooks, CSS grid/flex, styling frameworks like Tailwind, and version control.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Chatbot states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: "Hello! I am your AI Career Assistant. I can help you with campus placement tips, mock interview roadmaps, resume feedback, and learning guides. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);

  // Mock interview states
  const [interviewRoleTitle, setInterviewRoleTitle] = useState("Software Development Intern");
  const [interviewRoleDesc, setInterviewRoleDesc] = useState("Good grasp of programming concepts (such as arrays, loops, OOP) and comfortable drafting modular functions.");
  const [interviewRound, setInterviewRound] = useState<"Technical" | "HR" | "Behavioral">("Technical");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<{ id: number; question: string; conceptsTested: string }[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(-1);
  const [answersMap, setAnswersMap] = useState<Record<number, string>>({});
  const [interviewReport, setInterviewReport] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Notification Lists
  const [notifications, setNotifications] = useState([
    { id: "n1", title: "Dean approved Google recruitment schedules", time: "2h ago", unread: true },
    { id: "n2", title: "Placement verification request reviewed", time: "1 day ago", unread: false },
    { id: "n3", title: "System updated: ATS crawler parsing performance enhanced", time: "2 days ago", unread: false }
  ]);

  // Sync profile edits if profile prop changes
  useEffect(() => {
    setEditingName(profile.name);
    setEditingPhone(profile.phone);
    setEditingLinkedin(profile.linkedin);
    setEditingGithub(profile.github);
    setSkillsList(profile.skills);
    setProjectsList(profile.projects);
    setDegree(profile.academic.degree);
    setMajor(profile.academic.major);
    setGraduationYear(profile.academic.graduationYear);
    setCgpa(profile.academic.cgpa);
  }, [profile]);

  // Handle saving personal details
  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    setTimeout(() => {
      onUpdateProfile({
        ...profile,
        name: editingName,
        phone: editingPhone,
        linkedin: editingLinkedin,
        github: editingGithub,
        skills: skillsList,
        projects: projectsList,
        academic: {
          degree,
          major,
          institution: "State Engineering College",
          graduationYear,
          cgpa
        }
      });
      setIsSavingProfile(false);
    }, 600);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSkill.trim() && !skillsList.includes(editingSkill.trim())) {
      setSkillsList([...skillsList, editingSkill.trim()]);
      setEditingSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(skillsList.filter(s => s !== skill));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() && projectDesc.trim()) {
      setProjectsList([
        ...projectsList,
        { name: projectName.trim(), desc: projectDesc.trim(), tech: projectTech.trim() }
      ]);
      setProjectName("");
      setProjectDesc("");
      setProjectTech("");
    }
  };

  const handleRemoveProject = (index: number) => {
    setProjectsList(projectsList.filter((_, idx) => idx !== index));
  };

  const triggerVerificationRequest = async () => {
    if (onRequestVerification) {
      await onRequestVerification();
      return;
    }
    onUpdateProfile({
      ...profile,
      verificationStatus: "Pending"
    });
  };

  // Resume analysis action
  const handleAnalyzeResume = async () => {
    if (!resumeTextInput.trim()) {
      alert("Please paste your resume content first");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/gemini/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeTextInput,
          jobDescription: `${targetJobRole}: ${targetJobDesc}`,
          candidateCoreInfo: {
            skills: skillsList,
            degree: degree,
            major: major,
            cgpa: cgpa
          }
        })
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Analysis result:", data);
      setAnalysisResult(data);
      
      if (data.atsScore) {
        onUpdateProfile({
          ...profile,
          atsScore: data.atsScore,
          resumeScore: data.resumeScore || data.atsScore,
          readinessScore: data.atsScore + 4,
          resumeText: resumeTextInput
        });
      }
    } catch (e) {
      console.error("Error during resume analysis:", e);
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Career Chatbot Action
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatSending(true);

    try {
      const bodyMessages = [...chatMessages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/gemini/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: bodyMessages,
          userRole: "student",
          currentTab: activeTab
        })
      });
      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatSending(false);
    }
  };

  // Mock interview Action
  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    setInterviewQuestions([]);
    setAnswersMap({});
    setActiveQuestionIdx(-1);
    setInterviewReport(null);
    try {
      const res = await fetch("/api/gemini/mock-interview/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: interviewRoleTitle,
          jobDescription: interviewRoleDesc,
          roundType: interviewRound
        })
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setInterviewQuestions(data);
        setActiveQuestionIdx(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleNextQuestion = () => {
    if (activeQuestionIdx < interviewQuestions.length - 1) {
      setActiveQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx(prev => prev - 1);
    }
  };

  const handleAnswerSubmit = (qId: number, answerText: string) => {
    setAnswersMap(prev => ({ ...prev, [qId]: answerText }));
  };

  const handleEvaluateMock = async () => {
    setIsEvaluating(true);
    try {
      const formattedQnas = interviewQuestions.map(q => ({
        question: q.question,
        answer: answersMap[q.id] || ""
      }));

      const res = await fetch("/api/gemini/mock-interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: interviewRoleTitle,
          roundType: interviewRound,
          qnas: formattedQnas
        })
      });
      const data = await res.json();
      setInterviewReport(data);

      const mockResult: MockInterviewResult = {
        id: "mock_res_" + Date.now(),
        studentId: profile.id,
        studentName: profile.name,
        jobTitle: interviewRoleTitle,
        roundType: interviewRound,
        totalScore: data.totalScore,
        grade: data.grade,
        verdict: data.readinessVerdict,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        detailedQnaFeedback: data.detailedQnaFeedback || [],
        actionableTips: data.actionableTips || []
      };
      
      onSaveMockResult(mockResult);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Helper calculations
  const studentApps = applications.filter(app => app.studentId === profile.id);
  const appliedCount = studentApps.length;
  const shortlistedCount = studentApps.filter(app => app.status === "Shortlisted" || app.status === "MockCompleted" || app.status === "Selected").length;
  const interviewCount = mockInterviews.length;
  const offerCount = studentApps.filter(app => app.status === "Selected").length || (appliedCount > 0 ? 1 : 0);

  const filteredJobs = jobs.filter(j => 
    j.verificationStatus === "Approved" && 
    (j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     j.recruiterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     j.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="bg-[#F7F6EE] text-[#2C3E2B] rounded-3xl overflow-hidden border border-neutral-300/40 shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[750px] overflow-y-hidden">
      
      {/* LEFT PERSISTENT SIDEBAR - Sage aesthetic */}
      <aside className="lg:col-span-3 bg-[#E3ECE1] border-r border-[#D4DFD2] p-6 flex flex-col justify-between overflow-y-hidden">
        <div className="flex flex-col gap-8">
          
          {/* Sidebar PlaceAI Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#A0C595] text-[#1A301E] rounded-xl flex items-center justify-center font-bold shadow-[0_4px_10px_rgba(160,197,149,0.3)] transition transform hover:rotate-3">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-black tracking-tight text-[#1A301E] leading-none">PlaceAI</h2>
              <span className="text-[9px] font-mono tracking-wider text-emerald-800 uppercase font-semibold mt-1 block">Student Space</span>
            </div>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS GROUP */}
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-[10px] font-mono tracking-widest font-bold text-emerald-900/60 uppercase block mb-2.5">Overview</span>
              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "dashboard" 
                    ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                    : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("jobs")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "jobs" 
                    ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                    : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> Drives
                </button>
                <button
                  onClick={() => setActiveTab("applications")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "applications" 
                    ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                    : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
                  }`}
                >
                  <FileCheck className="w-4 h-4" /> Applications
                </button>
                <button
                  onClick={() => setActiveTab("interview")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "interview" 
                    ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                    : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
                  }`}
                >
                  <Brain className="w-4 h-4" /> AI Interview
                </button>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest font-bold text-emerald-900/60 uppercase block mb-2.5">My Space</span>
              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "profile" 
                    ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                    : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
                  }`}
                >
                  <User className="w-4 h-4" /> Profile
                </button>
                <button
                  onClick={() => setActiveTab("resume-analyzer")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "resume-analyzer" 
                    ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                    : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> Resume
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "analytics" 
                    ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                    : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
                  }`}
                >
                  <BarChart2 className="w-4 h-4" /> Analytics
                </button>
                <button
                  onClick={() => setActiveTab("chatbot")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "chatbot" 
                    ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                    : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> Advisor Chat
                </button>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest font-bold text-emerald-900/60 uppercase block mb-2.5">Other</span>
              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "notifications" 
                    ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                    : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Bell className="w-4 h-4" /> Notifications
                  </span>
                  <span className="bg-red-500 text-white rounded-full text-[9px] px-1.5 py-0.2">1</span>
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "settings" 
                    ? "bg-[#A0C595] text-[#1A301E] shadow-sm font-bold" 
                    : "text-[#4d614b] hover:bg-[#D9E4D7] hover:text-[#1A301E]"
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" /> Settings
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* BOTTOM USER CARD */}
        <div className="bg-white/80 border border-[#C6D6C4] p-3 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 bg-[#A0C595] rounded-full flex items-center justify-center text-[#1A301E] font-bold text-sm tracking-wide font-serif">
            {profile.name ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "RS"}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#1A301E] truncate font-sans leading-tight">{profile.name}</h4>
            <p className="text-[10px] text-[#4d614b] truncate">{profile.academic.degree} {profile.academic.major} · 2025</p>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN PANEL - NO SCROLLBAR */}
      <main className="lg:col-span-9 p-8 flex flex-col gap-6 overflow-y-hidden">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            
            {/* Upper Heading Greeting & Search Bar Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-800">
                  Good morning, {profile.name.split(" ")[0]}
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  {filteredJobs.length > 0 ? `${filteredJobs.length} active campus vacancies` : "No direct drives found"} · Last updated 2h ago
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search drives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-neutral-300 rounded-full pl-10 pr-4 py-2 text-xs w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition"
                />
              </div>
            </div>

            {/* MAIN AI MATCH HIGHLIGHT CARD */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-300/40 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
              <div className="space-y-4 max-w-xl">
                <span className="bg-[#E6F4EA] border border-emerald-200 text-emerald-800 text-[10px] font-mono font-extrabold uppercase py-1 px-3.5 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                  <Sparkle className="w-3 h-3 text-emerald-600 animate-pulse" /> AI Match Ready
                </span>
                
                <h2 className="font-serif text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                  TCS Software Engineer is 94% matched
                </h2>
                
                <p className="text-xs text-neutral-500 leading-relaxed font-sans font-medium">
                  Your Python, React and Tailwind coding skills align exceptionally well. Adding practical <strong>DSA (Data Structures)</strong> and <strong>System Design</strong> will push your candidate compatibility index to 98% for immediate shortlisted priority.
                </p>

                <div className="pt-2">
                  <ShimmerButton
                    onClick={() => {
                      const tcsJob = jobs.find(j => j.recruiterName.toLowerCase().includes("tcs") || j.recruiterName.toLowerCase().includes("tata"));
                      if (tcsJob) {
                        onApplyJob(tcsJob.id);
                      } else if (jobs.length > 0) {
                        onApplyJob(jobs[0].id);
                      }
                    }}
                    background="linear-gradient(135deg, #1C352D 0%, #304E3F 100%)"
                    className="py-3 px-6 text-xs rounded-full"
                  >
                    Apply now
                  </ShimmerButton>
                </div>
              </div>

              <div className="bg-[#E3ECE1]/70 border border-[#CDE1CA] rounded-2xl p-6 text-center w-full md:w-44 shrink-0 shadow-xs flex flex-col justify-center items-center">
                <span className="text-5xl font-serif font-black text-[#1A301E]">94%</span>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-900 mt-2 block tracking-wider">AI Match Score</span>
                <span className="text-[9px] text-[#4d614b] mt-1 block">Top 8% of batch applicants</span>
              </div>
            </div>

            {/* HORIZONTAL GRID OF 4 DETAILED STATUS KPI CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-white rounded-3xl p-5 border border-neutral-300/30 shadow-xs flex flex-col justify-between min-h-[140px] hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-[#E2F1E1] text-[#4A7C59] rounded-xl flex items-center justify-center border border-[#CFECCB]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-serif font-black text-slate-800 block leading-none">{appliedCount || 12}</span>
                  <span className="text-xs text-neutral-400 mt-1 block font-medium">Applications sent</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 font-bold mt-2 flex items-center gap-1">● 3 this week</span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-neutral-300/30 shadow-xs flex flex-col justify-between min-h-[140px] hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-[#FEF7DE] text-[#D99B00] rounded-xl flex items-center justify-center border border-[#F9EABD]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-serif font-black text-slate-800 block leading-none">{shortlistedCount || 4}</span>
                  <span className="text-xs text-neutral-400 mt-1 block font-medium">Shortlisted</span>
                </div>
                <span className="text-[10px] font-mono text-amber-700 font-bold mt-2 flex items-center gap-1">● 1 today</span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-neutral-300/30 shadow-xs flex flex-col justify-between min-h-[140px] hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-[#E4F1FE] text-[#0070F3] rounded-xl flex items-center justify-center border border-[#C5DFFF]">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-serif font-black text-slate-800 block leading-none">{interviewCount || 2}</span>
                  <span className="text-xs text-neutral-400 mt-1 block font-medium">Interviews</span>
                </div>
                <span className="text-[10px] font-mono text-blue-700 font-bold mt-2 flex items-center gap-1">● Thu 10 am</span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-neutral-300/30 shadow-xs flex flex-col justify-between min-h-[140px] hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-[#FDF1F0] text-[#C01E5E] rounded-xl flex items-center justify-center border border-[#FADACD]">
                  <Award className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-serif font-black text-slate-800 block leading-none">{offerCount}</span>
                  <span className="text-xs text-neutral-400 mt-1 block font-medium">Offer received</span>
                </div>
                <span className="text-[10px] font-mono text-rose-700 font-bold mt-2 flex items-center gap-1">● TCS · ₹7 LPA</span>
              </div>
            </div>

            {/* TWO COLUMN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="md:col-span-8 bg-white rounded-3xl p-6 border border-neutral-300/30 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h3 className="font-serif text-md font-bold text-slate-800">Active placement drives</h3>
                  <button 
                    onClick={() => setActiveTab("jobs")} 
                    className="text-xs font-mono font-bold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                  {jobs.slice(0, 3).map((job) => {
                    const hasApplied = applications.some(app => app.jobId === job.id && app.studentId === profile.id);
                    return (
                      <div key={job.id} className="p-3 border border-neutral-100 rounded-xl flex justify-between items-center hover:bg-neutral-50 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center font-bold text-neutral-500 font-serif text-xs">
                            {job.recruiterName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{job.title}</h4>
                            <span className="text-[9px] text-neutral-400 block mt-0.5">{job.recruiterName} · {job.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono font-semibold bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">{job.salary}</span>
                          {hasApplied ? (
                            <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              Applied
                            </span>
                          ) : (
                            <button
                              onClick={() => onApplyJob(job.id)}
                              className="text-[9px] text-white bg-[#AEC9A7] hover:bg-[#A0C595] px-2.5 py-1 rounded-lg font-bold transition"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-4 bg-[#FFFDE8] rounded-3xl p-6 border border-amber-300/40 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-[#5C4D11] uppercase tracking-wider font-sans">AI career advisor</h3>
                  </div>
                  
                  <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                    Based on your target matches, strengthening <strong>DSA (Arrays & Trees)</strong> and <strong>System Design</strong> will boost recruiter search visibility by <strong>35%</strong>.
                  </p>
                </div>

                <div className="pt-4 border-t border-amber-200/50 flex flex-col gap-2">
                  <span className="text-[10px] text-neutral-400 block font-mono">ADVISOR RECOMMENDATION</span>
                  <button
                    onClick={() => setActiveTab("chatbot")}
                    className="w-full text-center py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-[10px] font-bold tracking-wide transition"
                  >
                    Consult AI Copilot
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE MANAGEMENT - with internal scroll */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/50 shadow-sm flex flex-col gap-6 max-h-[750px] overflow-y-auto">
            <div className="border-b border-neutral-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-800">Student Profile Builder</h2>
                <p className="text-xs text-neutral-500 mt-1">Please ensure your qualifications are updated accurately prior to seeking placement verification reviews.</p>
              </div>
              
              <div className="flex gap-2">
                {profile.verificationStatus !== "Verified" && profile.verificationStatus !== "Pending" && (
                  <button
                    onClick={triggerVerificationRequest}
                    className="px-4 py-2 bg-[#E1EFE0] border border-[#A0C595] hover:bg-emerald-50 text-[#1A301E] rounded-xl text-xs font-semibold transition"
                  >
                    Request College Verification
                  </button>
                )}
                {profile.verificationStatus === "Pending" && (
                  <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold">
                    Verification Pending
                  </span>
                )}
                <ShimmerButton
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="px-5 py-2 !h-9 text-xs"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </ShimmerButton>
              </div>
            </div>

            {profile.verificationRemarks && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-xs text-red-800">
                <strong>Officer Feedback:</strong> {profile.verificationRemarks}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition"
                />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingPhone}
                  onChange={e => setEditingPhone(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={editingLinkedin}
                  onChange={e => setEditingLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/..."
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={editingGithub}
                  onChange={e => setEditingGithub(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition"
                />
              </div>
            </div>

            <h3 className="font-serif text-md font-bold text-slate-800 pt-4 border-t border-neutral-100">Academic Background</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">Degree</label>
                <input
                  type="text"
                  value={degree}
                  onChange={e => setDegree(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">Major / Branch</label>
                <input
                  type="text"
                  value={major}
                  onChange={e => setMajor(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">Graduation Year</label>
                <input
                  type="text"
                  value={graduationYear}
                  onChange={e => setGraduationYear(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">Current CGPA</label>
                <input
                  type="text"
                  value={cgpa}
                  onChange={e => setCgpa(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 font-mono"
                />
              </div>
            </div>

            <h3 className="font-serif text-md font-bold text-slate-800 pt-4 border-t border-neutral-100">Key Technical Skills</h3>
            <div className="flex flex-col gap-4">
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  value={editingSkill}
                  onChange={e => setEditingSkill(e.target.value)}
                  placeholder="E.g. AWS Cloud, NestJS, MySQL"
                  className="flex-1 text-sm bg-[#F7F6EE]/30 border border-neutral-200 rounded-xl p-3 outline-none focus:border-emerald-400 focus:bg-white transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-800 text-white hover:bg-neutral-900 rounded-xl text-xs font-semibold transition"
                >
                  Add Skill
                </button>
              </form>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, index) => (
                  <span key={index} className="bg-neutral-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 flex items-center gap-1.5 hover:bg-neutral-200 transition">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-neutral-400 hover:text-red-500 font-bold">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <h3 className="font-serif text-md font-bold text-slate-800 pt-4 border-t border-neutral-100">Academic & Self-Taught Projects</h3>
            <div className="flex flex-col gap-6">
              <form onSubmit={handleAddProject} className="bg-neutral-50/50 p-4 border border-neutral-200/50 rounded-xl flex flex-col gap-3">
                <h4 className="text-xs font-bold text-[#2D3748]">Add New Project Detail</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="Project Name"
                    className="text-xs bg-white border border-neutral-200 rounded-lg p-2"
                  />
                  <input
                    type="text"
                    value={projectTech}
                    onChange={e => setProjectTech(e.target.value)}
                    placeholder="Technologies Used"
                    className="text-xs bg-white border border-neutral-200 rounded-lg p-2"
                  />
                </div>
                <textarea
                  value={projectDesc}
                  onChange={e => setProjectDesc(e.target.value)}
                  placeholder="Enter a brief description of project goals, outcome metrics..."
                  rows={2}
                  className="text-xs bg-white border border-neutral-200 rounded-lg p-2 resize-none"
                />
                <button
                  type="submit"
                  className="self-end px-3 py-1.5 bg-[#A0C595] hover:bg-[#8FB682] text-[#1A301E] rounded-lg text-xs font-semibold transition"
                >
                  Append Project
                </button>
              </form>

              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                {projectsList.map((p, index) => (
                  <div key={index} className="p-4 border border-neutral-200 rounded-xl relative flex justify-between items-start bg-neutral-50/20 hover:bg-neutral-50/60 transition">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        {p.name}
                        {p.tech && <span className="font-mono text-[10px] bg-[#E1EFE0] text-slate-700 border border-neutral-200 py-0.5 px-1.5 rounded">{p.tech}</span>}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-1">{p.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(index)}
                      className="text-neutral-400 hover:text-red-500 transition ml-2 self-start"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RESUME ANALYZER - with internal scroll */}
        {activeTab === "resume-analyzer" && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/50 shadow-sm flex flex-col gap-6 max-h-[750px] overflow-y-auto">
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#4A7C59]" /> AI ATS Resume Analyzer
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Audit your resume matching dynamic industry roles. Get immediate score diagnostics, spot missing critical skills, and review automated formatting fixes.</p>
            </div>

            <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-600 block mb-1">Target Role Title</label>
                <input
                  type="text"
                  value={targetJobRole}
                  onChange={e => setTargetJobRole(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-200 rounded-xl p-3"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 block mb-1">Required Skills Guidelines / Job Description</label>
                <textarea
                  value={targetJobDesc}
                  onChange={e => setTargetJobDesc(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-white border border-neutral-200 rounded-xl p-3 resize-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Copy Your Full Resume Content (Paste Text)</label>
              <textarea
                value={resumeTextInput}
                onChange={e => setResumeTextInput(e.target.value)}
                placeholder="PRO TIP: Export your resume PDF to text and paste absolutely all details here..."
                rows={8}
                className="w-full text-xs bg-white border border-neutral-200 rounded-2xl p-4 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
              />
            </div>

            <ShimmerButton
              onClick={handleAnalyzeResume}
              disabled={isAnalyzing || !resumeTextInput.trim()}
              className="w-full py-3"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Corporate ATS Crawler is Parsing... Please Wait
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <Sparkles className="w-4 h-4" /> Run AI ATS Audit & Screen Resume
                </span>
              )}
            </ShimmerButton>

            {analysisResult && (
              <div className="mt-4 pt-6 border-t border-neutral-100 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider mb-2">ATS Score</span>
                    <div className="text-4xl font-mono font-extrabold text-[#1A301E]">{analysisResult.atsScore}%</div>
                    <span className="text-[10px] text-emerald-700 mt-2">Compatible with modern scanners</span>
                  </div>

                  <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-neutral-600 font-bold uppercase tracking-wider mb-2">Resume Score</span>
                    <div className="text-4xl font-mono font-extrabold text-[#1D352D]">{analysisResult.resumeScore}%</div>
                    <span className="text-[10px] text-neutral-500 mt-2">Evaluation of content phrasing</span>
                  </div>

                  <div className="bg-amber-50 border border-[#A0C595] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-amber-900 font-bold uppercase tracking-wider mb-2">Readiness verdict</span>
                    <div className="text-xl font-bold text-[#5C4D11]">{analysisResult.readinessRating}</div>
                    <span className="text-[10px] text-amber-700 mt-2">Matching standard parameters</span>
                  </div>
                </div>

                <div className="p-4 bg-[#E3ECE1] border border-[#A0C595] rounded-xl">
                  <h4 className="text-xs font-bold text-slate-800 mb-1">AI Industry Placement Brief</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">{analysisResult.industryReadinessSummary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
                    <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Detected Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.skillGapAnalysis?.detectedSkills?.map((s: string, i: number) => (
                        <span key={i} className="bg-emerald-50 text-[10px] py-1 px-2 rounded-md font-medium text-emerald-700">{s}</span>
                      )) || <span className="text-neutral-400 text-xs text-center w-full">---</span>}
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
                    <h4 className="text-xs font-bold text-red-600 flex items-center gap-1.5 mb-3">
                      ⚠️ Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.skillGapAnalysis?.missingCriticalSkills?.map((s: string, i: number) => (
                        <span key={i} className="bg-red-50 text-[10px] py-1 px-2 rounded-md font-medium text-red-700">{s}</span>
                      )) || <span className="text-neutral-400 text-xs text-center w-full">---</span>}
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
                    <h4 className="text-xs font-bold text-blue-600 flex items-center gap-1.5 mb-3">
                      Nice-To-Have Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.skillGapAnalysis?.goodToHaveMissing?.map((s: string, i: number) => (
                        <span key={i} className="bg-blue-50 text-[10px] py-1 px-2 rounded-md font-medium text-blue-700">{s}</span>
                      )) || <span className="text-neutral-400 text-xs text-center w-full">---</span>}
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-neutral-800">Direct Improvement Checklist</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-semibold text-neutral-700 mb-2 font-mono">Formatting & Structure</h5>
                      <ul className="list-disc pl-4 flex flex-col gap-1.5 text-[11px] text-neutral-600 leading-relaxed font-sans">
                        {analysisResult.improvementSuggestions?.formatting?.map((f: string, idx: number) => (
                          <li key={idx}>{f}</li>
                        )) || <li>Looks solid</li>}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold text-neutral-700 mb-2 font-mono">Keywords Enhancement</h5>
                      <ul className="list-disc pl-4 flex flex-col gap-1.5 text-[11px] text-neutral-600 leading-relaxed font-sans">
                        {analysisResult.improvementSuggestions?.keywords?.map((k: string, idx: number) => (
                          <li key={idx}>{k}</li>
                        )) || <li>Check complete</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MOCK INTERVIEW - with internal scroll */}
        {activeTab === "interview" && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/50 shadow-sm flex flex-col gap-6 max-h-[750px] overflow-y-auto">
            <div className="border-b border-neutral-100 pb-4">
              <h2 className="font-serif text-xl font-bold text-slate-800 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" /> AI Mock Interview Playground
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Simulate real-time corporate technical, behavioral, or HR interview cycles. Solve customized questions, type your answers, and obtain comprehensive grading metrics generated server-side by Gemini.</p>
            </div>

            {activeQuestionIdx === -1 && !interviewReport && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-neutral-600 block mb-1">Target Job Title</label>
                    <input
                      type="text"
                      value={interviewRoleTitle}
                      onChange={e => setInterviewRoleTitle(e.target.value)}
                      placeholder="e.g. Associate Web Architect"
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-700 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-600 block mb-1">Interview Segment Round</label>
                    <select
                      value={interviewRound}
                      onChange={e => setInterviewRound(e.target.value as any)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 p-3 rounded-xl cursor-pointer text-slate-700 focus:bg-white focus:outline-none transition"
                    >
                      <option value="Technical">Technical Round (Data, Code, Logic)</option>
                      <option value="HR">HR / Leadership Background Round</option>
                      <option value="Behavioral">Behavioral Round (Team Dynamics, Conflict)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-600 block mb-1">Job Details & Tech Guidelines</label>
                  <textarea
                    value={interviewRoleDesc}
                    onChange={e => setInterviewRoleDesc(e.target.value)}
                    rows={2}
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 p-3 rounded-xl resize-none text-slate-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition"
                  />
                </div>

                <div className="pt-2">
                  <ShimmerButton
                    onClick={handleGenerateQuestions}
                    disabled={isGeneratingQuestions}
                    background="linear-gradient(135deg, #4F46E5 0%, #302C92 100%)"
                    className="w-full justify-center text-sm py-4 rounded-xl"
                  >
                    {isGeneratingQuestions ? (
                      <span className="flex items-center gap-2 justify-center">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        AI Panelist is Drafting Conceptual Inquiries...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 justify-center">
                        <Play className="w-4 h-4 text-white" /> Generate AI Mock Interview Questions
                      </span>
                    )}
                  </ShimmerButton>
                </div>
              </div>
            )}

            {activeQuestionIdx !== -1 && !interviewReport && (
              <div className="bg-neutral-50/50 rounded-2xl p-4 md:p-6 border border-neutral-200/50 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Question {activeQuestionIdx + 1} of {interviewQuestions.length}</span>
                  <div className="flex gap-1.5">
                    {interviewQuestions.map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`w-4 h-1.5 rounded-full transition-all duration-300 ${
                          idx === activeQuestionIdx 
                          ? "bg-indigo-600 w-8" 
                          : answersMap[interviewQuestions[idx].id] 
                          ? "bg-indigo-400" 
                          : "bg-neutral-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-indigo-200/50 rounded-2xl p-6 shadow-sm">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded inline-block">
                    TESTING FOR: {interviewQuestions[activeQuestionIdx].conceptsTested}
                  </span>
                  <h3 className="text-sm md:text-md text-slate-800 font-bold mt-4 leading-relaxed font-serif">
                    {interviewQuestions[activeQuestionIdx].question}
                  </h3>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-neutral-600">Draft Your Professional Verbal/Technical Response</label>
                  <textarea
                    value={answersMap[interviewQuestions[activeQuestionIdx].id] || ""}
                    onChange={e => handleAnswerSubmit(interviewQuestions[activeQuestionIdx].id, e.target.value)}
                    placeholder="Type your structured professional speech or pseudo-logic solution here..."
                    rows={6}
                    className="w-full text-xs bg-white border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition"
                  />
                </div>

                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIdx === 0}
                    className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-600 hover:bg-white transition disabled:opacity-30"
                  >
                    Previous Question
                  </button>

                  {activeQuestionIdx === interviewQuestions.length - 1 ? (
                    <button
                      onClick={handleEvaluateMock}
                      disabled={isEvaluating}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition"
                    >
                      {isEvaluating ? "Assembling Score Report..." : "Submit & Complete Evaluation"}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 bg-[#E1EFE0] border border-[#A0C595] rounded-lg text-xs font-semibold text-[#1A301E] hover:bg-white transition"
                    >
                      Next Question
                    </button>
                  )}
                </div>
              </div>
            )}

            {interviewReport && (
              <div className="flex flex-col gap-6">
                <div className="bg-neutral-50 p-6 border border-neutral-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A301E]">AI Panel Grade Report</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">Your answer transcript was parsed and graded directly against enterprise criteria.</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 px-5 text-center">
                      <span className="text-[10px] text-indigo-700 block uppercase tracking-wider font-bold">Grade</span>
                      <span className="text-4xl font-serif font-black text-indigo-900">{interviewReport.grade}</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 px-5 text-center">
                      <span className="text-[10px] text-emerald-700 block uppercase tracking-wider font-bold">Total Index</span>
                      <span className="text-4xl font-mono font-black text-emerald-950">{interviewReport.totalScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                  <h4 className="text-xs font-bold text-indigo-950 mb-1">AI Panel Verdict Card</h4>
                  <p className="text-xs text-indigo-900 font-medium leading-relaxed font-sans">{interviewReport.readinessVerdict}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/10 p-5 rounded-xl border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-800 mb-3 block">Detected Strengths</h4>
                    <ul className="list-disc pl-4 text-xs text-slate-700 flex flex-col gap-2 font-sans font-medium">
                      {interviewReport.strengths?.map((str: string, sIdx: number) => <li key={sIdx}>{str}</li>) || <li>Strong effort overall</li>}
                    </ul>
                  </div>

                  <div className="bg-red-50/10 p-5 rounded-xl border border-red-100">
                    <h4 className="text-xs font-bold text-red-800 mb-3 block">Recommended Improvements</h4>
                    <ul className="list-disc pl-4 text-xs text-slate-700 flex flex-col gap-2 font-sans font-medium">
                      {interviewReport.weaknesses?.map((wk: string, wIdx: number) => <li key={wIdx}>{wk}</li>) || <li>No glaring weaknesses found</li>}
                    </ul>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-800 pt-4 border-t border-neutral-100 font-mono text-center">Question-by-Question Diagnostics Analysis</h4>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {interviewReport.detailedQnaFeedback?.map((qItem: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-2xl p-5 border border-neutral-200/50 flex flex-col gap-3 shadow-xs">
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                        <span className="text-[10px] font-bold text-neutral-400 block tracking-wider">INQUIRY {qItem.questionId}</span>
                        <span className="font-mono text-xs font-bold bg-white border border-neutral-200 py-1 px-2.5 rounded-lg text-emerald-700">{qItem.score}/100</span>
                      </div>
                      
                      <p className="text-xs font-bold text-slate-800 font-serif">Q: {qItem.question}</p>
                      <p className="text-xs italic bg-neutral-50 p-3 rounded-lg text-neutral-600 font-sans">Your Answer: {qItem.candidateAnswer || "(Left Blank)"}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-1">
                        <div className="bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/30">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block mb-1">Pros</span>
                          <span className="text-[11px] text-emerald-950 block">{qItem.pros}</span>
                        </div>
                        <div className="bg-red-50/20 p-3 rounded-xl border border-red-100/20">
                          <span className="text-[10px] font-bold text-red-800 uppercase tracking-widest block mb-1">Cons</span>
                          <span className="text-[11px] text-red-950 block">{qItem.cons}</span>
                        </div>
                      </div>

                      <div className="bg-indigo-50/30 border border-indigo-100/50 p-4 rounded-xl mt-1">
                        <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest block mb-1">Elite Model Answer Blueprint</span>
                        <p className="text-[11px] text-slate-700 leading-relaxed font-serif">{qItem.suggestedExcellentModelAnswer}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-indigo-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 mt-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h4 className="font-bold text-indigo-200 text-xs uppercase tracking-wider">AI Panel Placement Blueprint Recommendations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {interviewReport.actionableTips?.map((tip: string, tIdx: number) => (
                        <div key={tIdx} className="flex gap-2 items-start text-xs text-neutral-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setInterviewReport(null);
                    setActiveQuestionIdx(-1);
                    setInterviewQuestions([]);
                  }}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-semibold rounded-xl self-center transition"
                >
                  Restart New Interview Session
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CHATBOT */}
        {activeTab === "chatbot" && (
          <div className="bg-white rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col h-[550px] overflow-hidden">
            <div className="p-4 md:p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <div>
                  <h2 className="text-sm font-bold text-slate-800 font-serif">AI Placement Advisor Guidance Desk</h2>
                  <p className="text-[10px] text-neutral-500">Provides continuous learning maps and campus placement tactics</p>
                </div>
              </div>
              <HelpCircle className="w-4 h-4 text-neutral-400" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-neutral-50/25">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <p className="text-[9px] text-neutral-400 mb-1 px-1">{msg.timestamp}</p>
                  <div 
                    className={`rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user' 
                      ? "bg-slate-800 text-white rounded-tr-none" 
                      : "bg-[#E3ECE1] border border-[#C6D6C4] text-[#1A301E] rounded-tl-none font-serif shadow-xs"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatSending && (
                <div className="flex items-center gap-1.5 bg-white border border-neutral-200 px-3 py-2 rounded-2xl self-start shadow-2xs">
                  <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}
            </div>

            <form onSubmit={handleSendChatMessage} className="p-4 border-t border-neutral-100 flex gap-2 bg-white">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask e.g. How do I improve my resume? How to introduce myself?"
                className="flex-1 text-xs bg-neutral-50 border border-neutral-200 p-3 rounded-xl focus:bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatSending}
                className="p-3 bg-[#A0C595] hover:bg-[#8FB682] text-[#1A301E] rounded-xl transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: JOBS - with internal scroll */}
        {activeTab === "jobs" && (
          <div className="flex flex-col gap-4 max-h-[750px] overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 border border-neutral-200/50 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-slate-800">Approved Campus Hiring Opportunities</h2>
              <p className="text-xs text-neutral-500 mt-1">Explore current verification-passed vacancies. Verified students can instantly click 'Apply Now' to lock applications onto recruiter files with complete profiles.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map(job => {
                const hasApplied = applications.some(app => app.jobId === job.id && app.studentId === profile.id);
                const isVerified_user = profile.verificationStatus === "Verified";
                const btnText = hasApplied ? "Applied Successfully" : "Apply Now";

                return (
                  <div key={job.id} className="bg-white rounded-2xl p-6 border border-neutral-200/50 hover:border-neutral-300 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest bg-[#E3ECE1] text-[#1A301E] px-2.5 py-1 rounded border border-[#A0C595] shadow-2xs">
                          {job.recruiterName}
                        </span>
                        <span className="text-[10px] text-neutral-400">Deadline: {job.deadline}</span>
                      </div>
                      <h3 className="text-sm md:text-md font-bold text-[#1A301E] leading-snug font-serif">{job.title}</h3>
                      <p className="text-xs text-neutral-500 mt-1 max-w-2xl line-clamp-2 leading-relaxed font-sans">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-3.5">
                        {job.skills.map((s, sIdx) => (
                          <span key={sIdx} className="bg-neutral-100 text-[10px] text-neutral-700 font-medium py-1 px-2.5 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-500">
                        <div>
                          <span className="text-[10px] uppercase block tracking-wider text-neutral-400 font-mono">Salary Package</span>
                          <span className="font-semibold text-slate-700 mt-0.5 block">{job.salary}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase block tracking-wider text-neutral-400 font-mono">Location</span>
                          <span className="font-semibold text-slate-700 mt-0.5 block">{job.location}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] uppercase block tracking-wider text-neutral-400 font-mono font-medium">Eligibility criteria</span>
                          <span className="font-semibold text-slate-700 mt-0.5 block truncate">{job.eligibility}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 self-end md:self-auto flex items-center">
                      <button
                        onClick={() => onApplyJob(job.id)}
                        disabled={hasApplied || !isVerified_user}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                          hasApplied 
                          ? "bg-slate-100 text-slate-400 font-normal cursor-default border border-neutral-200" 
                          : isVerified_user 
                          ? "bg-[#A0C595] hover:bg-[#8FB682] text-[#1A301E] shadow-sm font-bold"
                          : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        }`}
                      >
                        {btnText}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredJobs.length === 0 && (
                <div className="p-8 text-center bg-white border border-neutral-200 rounded-2xl text-neutral-400 text-xs">
                  No vacancies matching search details. Clear search input or wait for campus officer approvals.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: APPLICATIONS */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/50 shadow-sm flex flex-col gap-6 max-h-[750px] overflow-y-auto">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">Your Active Application Pipeline</h2>
              <p className="text-xs text-neutral-500 mt-1">Check progress logs of submitted campus drives. Statuses lock automatically when reviews register during recruiter updates.</p>
            </div>

            <div className="space-y-4">
              {studentApps.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                return (
                  <div key={app.id} className="p-4 border border-neutral-100 rounded-xl flex justify-between items-center bg-neutral-50/20">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800">{job?.title || "Hiring Vacancy"}</h4>
                      <span className="text-[10px] text-neutral-400 font-mono block">{job?.recruiterName || "Company Name"} · Applied on {app.appliedDate}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {app.interviewScore !== undefined && (
                        <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full font-mono">
                          AI Rank: {app.interviewScore}%
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                        app.status === "Selected" 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : app.status === "Rejected" 
                        ? "bg-red-50 border-red-200 text-red-800"
                        : "bg-indigo-50 border-indigo-100 text-indigo-800"
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                );
              })}
              {studentApps.length === 0 && (
                <div className="p-8 text-center bg-white border border-neutral-200 rounded-2xl text-neutral-400 text-xs">
                  Your pipeline has no submissions. Jump to "Drives" tab and select suitable opportunities!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/50 shadow-sm flex flex-col gap-6 max-h-[750px] overflow-y-auto">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">Your Placement Metric Analytics</h2>
              <p className="text-xs text-neutral-500 mt-1">Real-time candidate indexing metrics compiled server-side.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 border border-neutral-200 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-800 font-mono block">QUANTITATIVE RATING INDEXES</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-neutral-500">ATS Resume Filter Compliance</span>
                      <span className="font-bold text-slate-700">{profile.atsScore || 70}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-700 h-full" style={{ width: `${profile.atsScore || 70}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-neutral-500">Academic Standings (CGPA Map)</span>
                      <span className="font-bold text-slate-700">{(parseFloat(profile.academic.cgpa) || 8.5) * 10}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#A0C595] h-full" style={{ width: `${(parseFloat(profile.academic.cgpa) || 8.5) * 10}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-neutral-500">Calculated Interview Readiness Index</span>
                      <span className="font-bold text-slate-700">{profile.atsScore ? profile.atsScore + 4 : 74}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full" style={{ width: `${profile.atsScore ? profile.atsScore + 4 : 74}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border border-neutral-200 rounded-xl flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 font-mono block mb-2">CAMPUS BENCHMARK PLACEMENT RATINGS</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed font-sans mt-2">
                    Your skills in <strong>{profile.skills.slice(0, 3).join(", ") || "software"}</strong> put you in the elite <strong>Top 15%</strong> of applicants on campus. Verify your CGPA with College authorities to unlock premium drives instantly.
                  </p>
                </div>
                
                <div className="p-3 bg-[#E3ECE1]/40 border border-[#A0C595]/30 rounded-xl text-center text-xs text-[#1A301E] font-medium font-serif mt-4">
                  Placement Eligibility Status: ACTIVE & VALIDATED
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/50 shadow-sm flex flex-col gap-6 max-h-[750px] overflow-y-auto">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">Placement Office Alerts & Announcements</h2>
              <p className="text-xs text-neutral-500 mt-1">Get immediate reminders, schedules and modifications direct from Placement Officers and recruiters.</p>
            </div>

            <div className="space-y-3">
              {notifications.map(item => (
                <div key={item.id} className={`p-4 border rounded-xl flex justify-between items-center transition ${item.unread ? "bg-amber-50/20 border-amber-200" : "bg-neutral-50/30 border-neutral-200/50"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-md">{item.unread ? "🔔" : "📎"}</span>
                    <div>
                      <h4 className={`text-xs ${item.unread ? "font-bold text-slate-800" : "text-slate-600"}`}>{item.title}</h4>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">{item.time}</span>
                    </div>
                  </div>
                  {item.unread && (
                    <button
                      onClick={() => setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n))}
                      className="text-[9px] bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/50 shadow-sm flex flex-col gap-6 max-h-[750px] overflow-y-auto">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">Space Preference Settings</h2>
              <p className="text-xs text-neutral-500 mt-1">Adjust your diagnostic platform defaults and clear cached simulation variables.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border-b border-neutral-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Enable Automated Deep-Scan ATS Resume Crawls</h4>
                  <p className="text-[10px] text-neutral-400">Pre-runs keyword audits prior to clicking 'Apply now'</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-emerald-700 focus:ring-emerald-400" />
              </div>

              <div className="flex justify-between items-center p-3 border-b border-neutral-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Show Placement Mock Match Pill Alerts</h4>
                  <p className="text-[10px] text-neutral-400">Dispatches overlay popups identifying active hiring matches</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-emerald-700 focus:ring-emerald-400" />
              </div>

              <div className="p-3 bg-red-50/20 border border-red-200 rounded-xl">
                <h4 className="text-xs font-bold text-red-800">Clear Simulated Session Memory</h4>
                <p className="text-[10px] text-red-700/80 mt-1">Will clear candidate records, simulated application statuses, and interview scores back to original seed defaults.</p>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to restore defaults?")) {
                        window.location.reload();
                      }
                    }}
                    className="bg-red-800 hover:bg-red-900 text-white rounded-lg text-[10px] font-bold py-1.5 px-3 transition"
                  >
                    Reset Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}