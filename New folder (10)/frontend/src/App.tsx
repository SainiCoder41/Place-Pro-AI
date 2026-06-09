import { useState, useEffect, useCallback } from "react";
import { 
  Sparkles, Award, Star, Shield, HelpCircle, 
  ArrowRight, CheckCircle2, ChevronRight, Briefcase, GraduationCap, Users,
  Lock, LogOut, ArrowLeftRight, UserCheck, AlertTriangle,
  Home, Menu, X, ChevronDown
} from "lucide-react";
import Logo from "./components/Logo";
import VideoText from "./components/VideoText";
import ShimmerButton from "./components/ShimmerButton";
import StudentPortal from "./components/StudentPortal";
import RecruiterPortal from "./components/RecruiterPortal";
import PlacementOfficerPortal from "./components/PlacementOfficerPortal";
import AdminPortal from "./components/AdminPortal";
import BorderGlow from "./components/BorderGlow";
import AuthPage from "./components/AuthPage";
import { useAuth } from "./hooks/useAuth";
import { usePlatformData } from "./hooks/usePlatformData";
import * as studentsApi from "./api/students";
import * as jobsApi from "./api/jobs";
import * as applicationsApi from "./api/applications";
import * as drivesApi from "./api/drives";
import * as mockApi from "./api/mockInterviews";
import * as adminApi from "./api/admin";
import { login as apiLogin } from "./api/auth";
import { StudentProfile, Job, Application, PlacementDrive, MockInterviewResult, UserRole } from "./types";

const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string }> = {
  student: { email: "aarav.sharma@collegetech.edu", password: "password123" },
  recruiter: { email: "recruitment@google.com", password: "password123" },
  placementOfficer: { email: "placement.officer@collegetech.edu", password: "password123" },
  admin: { email: "admin.root@collegetech.edu", password: "password123" },
};

export default function App() {
  const { currentUser, setCurrentUser, logout, isLoading: authLoading } = useAuth();
  const {
    students: studentsByState,
    jobs: jobsByState,
    applications: applicationsByState,
    drives: drivesByState,
    mockInterviews: mockInterviewsByState,
    studentProfile,
    isLoading: dataLoading,
    refreshAll,
    setStudentProfile,
    setApplications,
    setJobs,
    setDrives,
    setMockInterviews,
    setStudents,
  } = usePlatformData(currentUser);

const [activePortalIndex, setActivePortalIndex] = useState<number>(() => {
  const savedPortal = localStorage.getItem("activePortalIndex");

  if (savedPortal) {
    return Number(savedPortal);
  }

  const savedUser = localStorage.getItem("placely_cur_user");

  if (savedUser) {
    const user = JSON.parse(savedUser);

    switch (user.role) {
      case "student":
        return 1;

      case "recruiter":
        return 2;

      case "placementOfficer":
        return 3;

      case "admin":
        return 4;

      default:
        return 0;
    }
  }

  return 0;
});
useEffect(() => {
  localStorage.setItem(
    "activePortalIndex",
    activePortalIndex.toString()
  );
}, [activePortalIndex]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) refreshAll();
  }, [currentUser, refreshAll]);

  const loggedInStudent = studentProfile || studentsByState.find(s => s.id === currentUser?.id) || studentsByState[0];

  // Map gooey navigation indices to core routing state
  const portalRoles = ["home", "student", "recruiter", "officer", "admin"] as const;
  const currentRole = portalRoles[activePortalIndex];

  // Map portal roles to system expectations for alignment screens
  const getRoleLabel = (role: UserRole) => {
    switch(role) {
      case "student": return "Candidate Student";
      case "recruiter": return "Corporate Recruiter";
      case "placementOfficer": return "Placement Officer";
      case "admin": return "System Administrator";
    }
  };

  const handleUpdateStudentProfile = async (editedProfile: StudentProfile) => {
    const updated = await studentsApi.updateMyProfile(editedProfile);
    setStudentProfile(updated);
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleApplyJob = async (jobId: string) => {
    const duplicate = applicationsByState.find(app => app.jobId === jobId && app.studentId === loggedInStudent?.id);
    if (duplicate) return;
    try {
      await applicationsApi.applyToJob(jobId);
      await refreshAll();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to apply to job");
    }
  };

  const handleRequestVerification = async () => {
    const updated = await studentsApi.requestVerification();
    setStudentProfile(updated);
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleSaveMockInterviewResult = async (result: MockInterviewResult) => {
    const saved = await mockApi.saveMockInterview(result);
    setMockInterviews(prev => [...prev, saved]);
    await refreshAll();
  };

  const handleCreateJob = async (newJob: Job) => {
    await jobsApi.createJob(newJob);
    await refreshAll();
  };

  const handleUpdateJob = async (editedJob: Job) => {
    await jobsApi.updateJob(editedJob.id, editedJob);
    await refreshAll();
  };

  const handleDeleteJob = async (jobId: string) => {
    await jobsApi.deleteJob(jobId);
    await refreshAll();
  };

  const handleUpdateApplicationStatus = async (appId: string, status: Application["status"]) => {
    const mock = mockInterviewsByState.find(m => {
      const app = applicationsByState.find(a => a.id === appId);
      return app && m.studentId === app.studentId;
    });
    await applicationsApi.updateApplicationStatus(appId, status, {
      interviewScore: status === "MockAssigned" && mock ? mock.totalScore : undefined,
    });
    await refreshAll();
  };

  const handleVerifyStudent = async (studentId: string, status: "Verified" | "Rejected", remarks?: string) => {
    await studentsApi.verifyStudent(studentId, status, remarks);
    await refreshAll();
  };

  const handleVerifyJob = async (jobId: string, status: "Approved" | "Rejected", remarks?: string) => {
    await jobsApi.verifyJob(jobId, status, remarks);
    await refreshAll();
  };

  const handleAddDrive = async (newDrive: PlacementDrive) => {
    await drivesApi.createDrive(newDrive);
    await refreshAll();
  };

  const handleDeleteDrive = async (driveId: string) => {
    await drivesApi.deleteDrive(driveId);
    await refreshAll();
  };

  const handleDeleteStudent = async (studentId: string) => {
    await studentsApi.deleteStudent(studentId);
    await refreshAll();
  };

  const handleGrantVerification = async (studentId: string) => {
    await studentsApi.grantVerification(studentId);
    await refreshAll();
  };

  const handleClearCache = async () => {
    await adminApi.resetPlatform();
    logout();
    setActivePortalIndex(0);
    alert("Platform data reset. Run `npm run seed` in the backend folder to repopulate demo data.");
  };

  const handleLogout = () => {
    logout();
    setActivePortalIndex(0);
  };

  const switchToDemoRole = useCallback(async (role: UserRole) => {
    const creds = DEMO_ACCOUNTS[role];
    const { user } = await apiLogin(creds.email, creds.password);
    setCurrentUser(user);
  }, [setCurrentUser]);

  const navItems = [
    { label: "Home Base", id: "home", icon: Home },
    { label: "Student Portal", id: "student", icon: GraduationCap },
    { label: "Corporate Recruiter", id: "recruiter", icon: Briefcase },
    { label: "Placement Officer", id: "officer", icon: Users },
    { label: "Root Admin", id: "admin", icon: Shield }
  ];

  // Map the navigation index to matching UserRole key
  const routeRoleMapping: Record<string, UserRole> = {
    "student": "student",
    "recruiter": "recruiter",
    "officer": "placementOfficer",
    "admin": "admin"
  };

  // Check auth validations
  const isGuest = currentUser === null;
  const isCorrectRole = currentRole === "home" || (currentUser && routeRoleMapping[currentRole] === currentUser.role);
console.log("CURRENT USER:", currentUser);
console.log("CURRENT ROLE:", currentRole);
console.log("EXPECTED ROLE:", routeRoleMapping[currentRole]);
console.log("IS CORRECT:", isCorrectRole);
  // Helper avatar colors
  const getUserBgClass = (role: UserRole) => {
    switch(role) {
      case "student": return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "recruiter": return "bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]";
      case "placementOfficer": return "bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]";
      case "admin": return "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]";
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4E8] font-sans text-[#2D3748] selection:bg-[#E5EEE4] selection:text-[#2D3748] pb-16 flex flex-col items-center">
      
      {/* Top Professional Sticky Responsive Header */}
     <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-neutral-200/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] supports-[backdrop-filter]:bg-white/60 px-4 transition-all duration-300">
  <div className="w-full max-w-7xl mx-auto py-3 flex items-center justify-between gap-4">
    
    {/* 1. Logo Section */}
    <div className="flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer">
      <Logo showText={true} />
    </div>

    {/* 2. Responsive Desktop Nav Tabs (Placeholder for your navItems map) */}
    <nav className="hidden md:flex items-center justify-center flex-1 gap-2">
      {/* Example of a modern tab: 
      <button className="px-4 py-2 text-sm font-semibold text-neutral-500 hover:text-black rounded-full hover:bg-neutral-100/80 transition-all duration-300">
        Dashboard
      </button> 
      */}
    </nav>

    {/* 3. Current Role Identity Bar, Login Control, & Mobile Menu Button */}
    <div className="flex items-center justify-end gap-3 flex-shrink-0">
      
      {/* Current Role Indicator (Desktop) */}
    

      {currentUser ? (
        <div className="flex items-center gap-2.5 bg-white pl-1.5 pr-2 py-1.5 rounded-full ring-1 ring-black/5 shadow-sm hover:shadow-md hover:ring-black/10 transition-all duration-300 max-w-[210px] md:max-w-none group">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase tracking-wider shrink-0 shadow-inner ${getUserBgClass(currentUser.role)}`}>
            {currentUser.name.substring(0, 2)}
          </div>
          <div className="hidden md:flex flex-col text-left pr-1">
            <span className="text-[11px] font-bold text-neutral-900 leading-tight tracking-tight">
              {currentUser.name}
            </span>
            <span className="text-[9px] font-mono font-semibold uppercase text-neutral-400 tracking-wider mt-0.5">
              {currentUser.role === "recruiter" && currentUser.companyName ? currentUser.companyName : getRoleLabel(currentUser.role)}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out transition"
            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all duration-200 shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setActivePortalIndex(1);
            setMobileMenuOpen(false);
          }}
          className="group flex items-center gap-2 text-xs font-semibold text-white bg-black px-5 py-2.5 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:bg-neutral-900 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
        >
          <Lock className="w-3.5 h-3.5 text-white/70 group-hover:text-emerald-400 transition-colors duration-300" />
          <span className="tracking-wide">Portal Login</span>
        </button>
      )}

      {/* Mobile / Tablet Menu Hamburger */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2.5 text-neutral-600 hover:text-black bg-white ring-1 ring-black/5 hover:ring-black/10 hover:bg-neutral-50 rounded-full shadow-sm transition-all duration-300 active:scale-95 cursor-pointer"
        aria-label="Toggle navigation"
      >
        {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>
    </div>
  </div>

  {/* 4. Mobile menu dropdown panel */}
  {mobileMenuOpen && (
    <div className="md:hidden absolute left-0 right-0 top-full bg-white/95 backdrop-blur-2xl border-b border-neutral-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] px-4 py-5 flex flex-col gap-1.5 z-50 transform transition-all duration-300 origin-top">
      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-3 mb-2">
        Menu
      </span>
      {navItems.map((item, idx) => {
        const IconComp = item.icon;
        const isActive = activePortalIndex === idx;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActivePortalIndex(idx);
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 text-left text-sm font-semibold px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              isActive 
                ? "bg-black text-white shadow-lg shadow-black/10 scale-[1.01]" 
                : "text-neutral-600 hover:text-black hover:bg-neutral-100/80"
            }`}
          >
            <IconComp className={`w-4 h-4 transition-colors ${isActive ? "text-emerald-400" : "text-neutral-400"}`} />
            <span className="flex-1 tracking-wide">{item.label}</span>
            {isActive && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
          </button>
        );
      })}
      
      {/* Display active state of user in mobile drawer */}
      {currentUser && (
        <div className="mt-4 pt-5 border-t border-neutral-200/60 flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm uppercase tracking-wider shadow-inner ${getUserBgClass(currentUser.role)}`}>
              {currentUser.name.substring(0, 2)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-neutral-900 tracking-tight">{currentUser.name}</span>
              <span className="text-[10px] font-mono font-semibold text-neutral-500 mt-0.5">{getRoleLabel(currentUser.role)}</span>
            </div>
          </div>
          <button
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold text-rose-600 bg-rose-50/80 hover:bg-rose-100 rounded-xl transition-colors duration-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )}
</header>

      {/* Main Container Wrapper */}
      <main className="w-full max-w-7xl px-4 mt-8 flex-1">

        {/* TAB 1: LANDING HUB */}
        {currentRole === "home" && (
          <div className="flex flex-col gap-12">
            
            {/* Elegant Hero Heading using VideoText */}
            <div className="text-center flex flex-col items-center max-w-4xl mx-auto mt-6">
             
              
              <h1 className="sr-only">AI Placement Drive Ecosystem</h1>
              
              <VideoText 
                src="https://cdn.magicui.design/ocean-small.webm"
                fontSize={15}
                fontWeight="black"
                fontFamily="Georgia, serif"
                className="w-full h-[150px] md:h-[220px]"
              >
                PLACEPRO AI
              </VideoText>

              <p className="font-serif text-lg md:text-xl text-[#4A5568] leading-relaxed mt-6 max-w-2xl px-4">
                Automated ATS Resume audit metrics, real-time Gemini corporate mock panels, and placement officers drives scheduled beautifully under one soft academic environment.
              </p>

              <div className="flex flex-wrap gap-4 mt-8 justify-center">
                <ShimmerButton 
                  onClick={() => {
                    // Go to Student portal view. Auth page will intercept if guest
                    setActivePortalIndex(1);
                  }}
                  className="py-3 px-8 text-sm"
                >
                  Enter Student Portal
                </ShimmerButton>
                
                <button
                  onClick={() => {
                    // Go to Officer portal view.
                    setActivePortalIndex(3);
                  }}
                  className="px-6 py-3 border border-neutral-300 text-[#4A5568] hover:bg-white text-sm font-semibold rounded-full hover:shadow-md transition active:scale-95"
                >
                  Placement Officer Lobby
                </button>
              </div>
            </div>

            {/* Feature Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Feature 1 */}
              <BorderGlow 
                borderRadius={20}
                className="p-6 md:p-8 hover:shadow-lg transition-all"
                backgroundColor="#FFFFFF"
              >
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center mb-4 border border-emerald-100">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-md font-bold text-slate-800 mb-2">AI ATS Resume Auditing</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Analyze dynamic vacancies using backend Gemini endpoints. Retrieve quantitative matching scores, detect keyword vacancies, and read tailored layout enhancements.
                </p>
              </BorderGlow>

              {/* Feature 2 */}
              <BorderGlow 
                borderRadius={20}
                className="p-6 md:p-8 hover:shadow-lg transition-all"
                backgroundColor="#FFFFFF"
              >
                <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center mb-4 border border-indigo-100">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-md font-bold text-slate-800 mb-2">AI Mock Panel Terminals</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Run simulated 5-question technical, HR, or behavioral interviewer rounds. Paste text answers and obtain robust analytical grades matching corporate standards.
                </p>
              </BorderGlow>

              {/* Feature 3 */}
              <BorderGlow 
                borderRadius={20}
                className="p-6 md:p-8 hover:shadow-lg transition-all"
                backgroundColor="#FFFFFF"
              >
                <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center mb-4 border border-rose-100">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-md font-bold text-slate-800 mb-2">Multi-Role Cooperation</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Continuous workflow connects student builders, corporate recruiters approving openings, campus officers verifying profiles, and root superuser log monitoring.
                </p>
              </BorderGlow>
            </div>

            {/* Quick Metrics SVG Diagram Block */}
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-neutral-200/50 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-emerald-800 bg-[#E5EEE4] border border-[#A5C89E] py-1 px-3 rounded-full">
                  Verified Campus Milestones
                </span>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-slate-800 mt-4 leading-snug">
                  Uniting verified pipelines with zero mock databases.
                </h2>
                <p className="text-xs text-neutral-500 mt-2 max-w-lg leading-relaxed">
                  Our algorithm cross-checks credentials locally, feeding candidates straight into recruiter lists once college verification seals are authorized by Dean admins.
                </p>
              </div>

              {/* SVG Charts display */}
              <div className="w-full md:w-auto shrink-0 flex gap-4">
                <div className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-200 text-center flex flex-col items-center">
                  <span className="text-3xl font-serif font-black text-slate-800">120+</span>
                  <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider mt-1">Active Students</span>
                </div>
                <div className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-200 text-center flex flex-col items-center">
                  <span className="text-3xl font-serif font-black text-slate-800">₹12 L</span>
                  <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider mt-1">Avg package</span>
                </div>
                <div className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-200 text-center flex flex-col items-center">
                  <span className="text-3xl font-serif font-black text-slate-800">92%</span>
                  <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider mt-1">Hire rate</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY GATE 1: GUEST SELECTS A PORTAL -> PROMPT AUTH */}
        {!currentRole !== true && currentRole !== "home" && isGuest && (
          <div className="flex flex-col gap-6 animate-fade-in py-4">
    

          <AuthPage
  onLoginSuccess={(session) => {
    console.log("LOGIN SUCCESS:", session);

    setCurrentUser(session);

    // Auto-open correct portal after login
    switch (session.role) {
      case "student":
        setActivePortalIndex(1);
        break;

      case "recruiter":
        setActivePortalIndex(2);
        break;

      case "placementOfficer":
        setActivePortalIndex(3);
        break;

      case "admin":
        setActivePortalIndex(4);
        break;

      default:
        setActivePortalIndex(0);
    }

    refreshAll();
  }}
  initialRoleTab={routeRoleMapping[currentRole]}
/>
          </div>
        )}

        {/* SECURITY GATE 2: USER LOGGED IN BUT CLICKS A DIFFERENT PORTAL TAB */}
        {!currentRole !== true && currentRole !== "home" && !isGuest && !isCorrectRole && (
          <div className="flex flex-col items-center justify-center max-w-2xl mx-auto text-center py-12 px-4 animate-fade-in">
            <BorderGlow borderRadius={32} className="bg-white p-8 border border-neutral-200 shadow-lg w-full flex flex-col items-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-700 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <span className="bg-rose-50 border border-rose-200 text-rose-800 rounded-full py-1 px-3 text-[10px] font-mono tracking-widest font-extrabold uppercase">
                Active Session Conflict
              </span>

              <h2 className="font-serif text-2xl font-bold text-slate-800 mt-4 leading-tight">
                Authorized Role Conflict
              </h2>

              <p className="text-sm text-neutral-500 mt-3 leading-relaxed max-w-md">
                You are currently signed in as <strong className="text-slate-800 font-bold">{currentUser.name}</strong> ({getRoleLabel(currentUser.role)}). 
                To open the <strong className="capitalize text-slate-800">{currentRole} portal</strong>, you can switch mode below or log out.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 mt-8 w-full">
                <button
                  onClick={() => switchToDemoRole(routeRoleMapping[currentRole])}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold rounded-full transition active:scale-95"
                >
                  <ArrowLeftRight className="w-4 h-4 text-emerald-700" />
                  Auto-switch to {getRoleLabel(routeRoleMapping[currentRole])}
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-mono tracking-wider uppercase rounded-full shadow-md transition active:scale-95"
                >
                  Logout Current Session
                </button>
              </div>

              <button
                onClick={() => setActivePortalIndex(0)} // Return to home safely
                className="text-xs text-neutral-400 hover:text-neutral-700 font-medium underline mt-6 underline-offset-4"
              >
                Or, return safe to Landing Hub base
              </button>
            </BorderGlow>
          </div>
        )}

        {/* SECURITY GATE 3: RENDER THE CORRECT MODULES ONCE VERIFIED AND ALIGNED */}
        {!isGuest && isCorrectRole && (authLoading || dataLoading) && !loggedInStudent && currentRole === "student" && (
          <div className="text-center py-12 text-xs text-neutral-400 font-mono animate-pulse">Loading portal data...</div>
        )}

        {!isGuest && isCorrectRole && !(currentRole === "student" && dataLoading && !loggedInStudent) && (
          <div className="animate-fade-in">
            {/* TAB 2: STUDENT PORTAL PANEL */}
            {currentRole === "student" && loggedInStudent && (
              <StudentProfilePortalWrapper 
                profile={loggedInStudent}
                jobs={jobsByState}
                applications={applicationsByState}
                mockInterviews={mockInterviewsByState}
                onUpdateProfile={handleUpdateStudentProfile}
                onApplyJob={handleApplyJob}
                onSaveMockResult={handleSaveMockInterviewResult}
                onRequestVerification={handleRequestVerification}
              />
            )}

            {/* TAB 3: RECRUITER PORTAL PANEL */}
            {currentRole === "recruiter" && (
              <RecruiterPortal 
                jobs={jobsByState}
                applications={applicationsByState}
                students={studentsByState}
                recruiterId={currentUser.id}
                recruiterName={currentUser.companyName || currentUser.name}
                onCreateJob={handleCreateJob}
                onUpdateJob={handleUpdateJob}
                onDeleteJob={handleDeleteJob}
                onUpdateApplicationStatus={handleUpdateApplicationStatus}
              />
            )}

            {/* TAB 4: PLACEMENT OFFICER PANEL */}
            {currentRole === "officer" && (
              <PlacementOfficerPortal 
                students={studentsByState}
                jobs={jobsByState}
                drives={drivesByState}
                onVerifyStudent={handleVerifyStudent}
                onVerifyJob={handleVerifyJob}
                onAddDrive={handleAddDrive}
                onDeleteDrive={handleDeleteDrive}
              />
            )}

            {/* TAB 5: ADMIN PORTAL PANEL */}
            {currentRole === "admin" && (
              <AdminPortal 
                students={studentsByState}
                jobs={jobsByState}
                applications={applicationsByState}
                onDeleteStudent={handleDeleteStudent}
                onGrantVerification={handleGrantVerification}
                onClearCache={handleClearCache}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Subwrapper to encapsulate StudentPortal cleanly
function StudentProfilePortalWrapper({
  profile,
  jobs,
  applications,
  mockInterviews,
  onUpdateProfile,
  onApplyJob,
  onSaveMockResult,
  onRequestVerification
}: {
  profile: StudentProfile;
  jobs: Job[];
  applications: Application[];
  mockInterviews: MockInterviewResult[];
  onUpdateProfile: (updated: StudentProfile) => void;
  onApplyJob: (jobId: string) => void;
  onSaveMockResult: (result: MockInterviewResult) => void;
  onRequestVerification: () => Promise<void>;
}) {
  return (
    <StudentPortal 
      profile={profile}
      jobs={jobs}
      applications={applications}
      mockInterviews={mockInterviews}
      onUpdateProfile={onUpdateProfile}
      onApplyJob={onApplyJob}
      onSaveMockResult={onSaveMockResult}
      onRequestVerification={onRequestVerification}
    />
  );
}

