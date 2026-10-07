import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import logoImg from '../assets/unnathi-logo.svg';
import brainScanImg from '../assets/brain-scan.jpg';
import { useMockDb } from '../store/useMockDb';
import { Lock, Mail, ArrowRight, ShieldCheck, Activity, BrainCircuit, Activity as ActivityIcon, Database, CheckCircle2, Microscope, TestTubes, Scan, HeartPulse, Bone, Sparkles } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const { users, fetchData } = useMockDb();
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // 3D Tilt Effect State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    // Only apply on desktop devices where hover is a thing
    if (window.matchMedia('(pointer: fine)').matches) {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 4; // -2 to 2 degrees
      const y = (clientY / window.innerHeight - 0.5) * -4; // -2 to 2 degrees
      setMousePos({ x, y });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let user = users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
      
      if (!user) {
        const res = await fetch('http://localhost:5000/api/users').catch(() => null);
        if (res) {
           const freshUsers = await res.json();
           user = freshUsers.find((u: any) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
        }
      }
      
      console.log('Login attempt:', { email, password, foundUser: user });
      
      if (!user) {
        alert(`Invalid credentials: User ${email} not found in database.`);
      } else if (user.password && user.password.trim() !== password.trim()) {
        alert(`Invalid credentials: Password mismatch.`);
      } else {
        login({ id: user.id, name: user.name, email: user.email, role: user.role, hospitalId: user.hospitalId, siteId: user.siteId });
      }
    } catch (err) {
      alert('Login failed due to network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center font-sans overflow-hidden bg-[#EBF4FA] relative selection:bg-[#0EA5E9] selection:text-white"
      onMouseMove={handleMouseMove}
    >
      
      {/* ========================================================= */}
      {/* 1. HIGHLY ANIMATED & TEXTURED AMBIENT BACKGROUND          */}
      {/* ========================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Blended Medical Image Texture */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.03] mix-blend-multiply"
          style={{ backgroundImage: `url(${brainScanImg})`, transform: 'scale(1.2)' }}
        />

        {/* Dynamic Light Gradients */}
        <motion.div 
          className="absolute top-[-20%] left-[-10%] w-[1200px] h-[1200px] bg-[radial-gradient(circle,rgba(56,189,248,0.15)_0%,transparent_70%)] rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(99,102,241,0.1)_0%,transparent_70%)] rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />

        {/* Custom Medical Flow & Waveforms (Diagnostics Theme) */}
        <div className="absolute inset-0 opacity-[0.25]">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(14,165,233,0)" />
                <stop offset="50%" stopColor="rgba(14,165,233,0.6)" />
                <stop offset="100%" stopColor="rgba(14,165,233,0)" />
              </linearGradient>
              <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(99,102,241,0)" />
                <stop offset="50%" stopColor="rgba(99,102,241,0.4)" />
                <stop offset="100%" stopColor="rgba(99,102,241,0)" />
              </linearGradient>
            </defs>
            <motion.path 
              d="M-100,400 C 200,200 400,600 720,400 C 1040,200 1240,600 1540,400"
              fill="none" 
              stroke="url(#waveGrad1)" 
              strokeWidth="3"
              animate={{ 
                d: [
                  "M-100,400 C 200,200 400,600 720,400 C 1040,200 1240,600 1540,400",
                  "M-100,400 C 200,600 400,200 720,400 C 1040,600 1240,200 1540,400",
                  "M-100,400 C 200,200 400,600 720,400 C 1040,200 1240,600 1540,400"
                ] 
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path 
              d="M-100,500 C 300,300 500,700 720,500 C 940,300 1140,700 1540,500"
              fill="none" 
              stroke="url(#waveGrad2)" 
              strokeWidth="2"
              animate={{ 
                d: [
                  "M-100,500 C 300,300 500,700 720,500 C 940,300 1140,700 1540,500",
                  "M-100,500 C 300,700 500,300 720,500 C 940,700 1140,300 1540,500",
                  "M-100,500 C 300,300 500,700 720,500 C 940,300 1140,700 1540,500"
                ] 
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </svg>
        </div>

        {/* Rotating Abstract Medical Rings */}
        <div className="absolute left-[15%] top-[50%] -translate-y-1/2 w-[800px] h-[800px] opacity-20">
          <motion.div 
            className="absolute inset-0 border-[1px] border-[#0EA5E9] rounded-full border-dashed"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-8 border-[2px] border-[#38BDF8] rounded-full border-dotted"
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-16 border-[1px] border-[#6366F1] rounded-full"
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Animated Data Streams / Particles */}
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={`stream-${i}`}
            className="absolute w-[2px] bg-gradient-to-b from-transparent via-[#0EA5E9] to-transparent"
            style={{
              height: Math.random() * 150 + 50 + 'px',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.4 + 0.1,
            }}
            animate={{ top: ['-20%', '120%'] }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}

        {/* Sweeping Scanner Line */}
        <motion.div 
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0EA5E9] to-transparent opacity-30 shadow-[0_0_30px_#0EA5E9]"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute left-0 right-0 h-40 bg-gradient-to-b from-transparent to-[#0EA5E9]/5 opacity-50"
          animate={{ top: ['-20%', '100%', '-20%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

      </div>

      {/* ========================================================= */}
      {/* 2. PREMIUM FOREGROUND UI (Interactive Glassmorphism)      */}
      {/* ========================================================= */}
      
      <div className="relative z-10 flex w-full max-w-[1400px] h-[800px] mx-auto px-8 items-center justify-between">
        
        {/* Left Side: Brand & Animated Features */}
        <div className="hidden lg:flex flex-col justify-center w-[50%] pr-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="bg-white/95 backdrop-blur-xl p-4 rounded-3xl border border-white/80 inline-flex items-center space-x-4 mb-10 shadow-[0_20px_40px_-15px_rgba(14,165,233,0.15)]"
          >
            <div className="bg-[#F8FAFC] p-3 rounded-2xl shadow-inner border border-[#E2E8F0]">
              <img src={logoImg} alt="Unnathi Teleradiology" className="h-10 object-contain" />
            </div>
            <div className="pr-6">
              <h2 className="text-2xl font-black tracking-widest text-[#0F172A] uppercase" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>UNNATHI</h2>
              <span className="text-xs font-bold text-[#0EA5E9] tracking-[0.3em] uppercase">Teleradiology</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl font-black text-[#0F172A] leading-[1.1] tracking-tight mb-8"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Precision <br/>
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8]">Teleradiology</span>
              <motion.div 
                className="absolute -bottom-2 left-0 right-0 h-3 bg-[#BAE6FD]/40 -z-10 rounded-full"
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
              />
            </span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 relative max-w-[600px]"
          >
            {/* Background Floating Equipment Icons */}
            <div className="absolute inset-0 pointer-events-none -z-10">
               <motion.div animate={{ y: [-15, 15], rotate: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-16 -top-10 text-[#0EA5E9]/10"><Scan className="w-48 h-48" /></motion.div>
               <motion.div animate={{ y: [15, -15], rotate: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -right-24 top-16 text-[#0EA5E9]/10"><ActivityIcon className="w-56 h-56" /></motion.div>
               <motion.div animate={{ y: [-20, 20], rotate: [0, 15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute left-10 -bottom-20 text-[#0EA5E9]/10"><BrainCircuit className="w-40 h-40" /></motion.div>
            </div>

            {[
              { id: 'multitenant', icon: Database, title: "Multi-Tenant Core", desc: "Centralized management of Sites, Branches, and Hospitals.", color: "from-blue-500 to-cyan-400", shadow: "shadow-cyan-500/20", delay: 0 },
              { id: 'worklist', icon: ActivityIcon, title: "Smart Worklists", desc: "Role-specific dashboards for Radiologists and Verifiers.", color: "from-purple-500 to-fuchsia-400", shadow: "shadow-fuchsia-500/20", delay: 0.1 },
              { id: 'dicom', icon: Scan, title: "Integrated Viewer", desc: "Native DICOM receiving and high-performance study viewing.", color: "from-emerald-500 to-teal-400", shadow: "shadow-teal-500/20", delay: 0.2 },
              { id: 'tat', icon: BrainCircuit, title: "TAT Monitoring", desc: "Real-time turnaround tracking and emergency prioritization.", color: "from-rose-500 to-orange-400", shadow: "shadow-rose-500/20", delay: 0.3 },
            ].map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ y: 0 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4 + (idx % 2), repeat: Infinity, ease: "easeInOut", delay: item.delay }}
                whileHover={{ scale: 1.05, y: -5, zIndex: 20 }}
                className="group relative p-6 bg-white/95 backdrop-blur-xl rounded-[28px] border border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all cursor-crosshair overflow-hidden"
              >
                {/* Automatic Continuous Particles */}
                <div className="absolute inset-0 pointer-events-none z-0">
                  <motion.div animate={{ y: [-20, -100], x: [-10, 20], opacity: [0.8, 0], scale: [0.5, 1.5] }} transition={{ duration: 2, repeat: Infinity }} className={`absolute bottom-4 left-8 w-2 h-2 rounded-full bg-gradient-to-r ${item.color}`} />
                  <motion.div animate={{ y: [-10, -80], x: [10, -20], opacity: [0.6, 0], scale: [1, 2] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} className={`absolute bottom-8 left-16 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.color}`} />
                  <motion.div animate={{ y: [-30, -120], x: [0, 30], opacity: [1, 0], scale: [0.8, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: 1 }} className={`absolute bottom-6 right-10 w-2.5 h-2.5 rounded-full bg-gradient-to-r ${item.color}`} />
                  
                  {/* Subtle sweep highlight only on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/80 to-transparent translate-x-[-150%] group-hover:animate-[shimmer_1.5s_ease-out] skew-x-[-20deg] opacity-0 group-hover:opacity-100" />
                </div>

                <div className="flex flex-col space-y-4 relative z-10">
                  <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg ${item.shadow} flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#0F172A] uppercase tracking-wide mb-1 flex items-center">
                      {item.title}
                      <Sparkles className="w-3.5 h-3.5 ml-2 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                    </h3>
                    <p className="text-[13px] text-[#64748B] font-semibold leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Side: The Premium Interactive Form */}
        <div className="w-full lg:w-[45%] flex justify-end perspective-1000">
          <motion.div 
            className="w-full max-w-[480px] bg-white/95 backdrop-blur-3xl rounded-[40px] p-10 md:p-12 shadow-[0_40px_100px_-20px_rgba(14,165,233,0.2),0_0_0_1px_rgba(255,255,255,1)] relative overflow-hidden group/card"
            style={{
              transform: `rotateY(${mousePos.x * 0.8}deg) rotateX(${mousePos.y * 0.8}deg)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.1s ease-out'
            }}
          >
            {/* Inner dynamic card glow */}
            <motion.div 
              className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#E0F2FE] to-[#F0F9FF] rounded-full blur-[60px] opacity-50 pointer-events-none group-hover/card:opacity-80 transition-opacity"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10">
              <div className="mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] rounded-2xl flex items-center justify-center mb-6 shadow-[0_15px_30px_-5px_rgba(14,165,233,0.4)] transform -rotate-6">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Access Portal</h2>
                <p className="text-[15px] text-[#64748B] font-medium">Verify your identity to proceed.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
                
                {/* Animated Email Input */}
                <div className="space-y-2 relative">
                  <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest pl-1">Organization Email</label>
                  
                  <div className={`relative flex items-center bg-[#F8FAFC] rounded-2xl transition-all duration-300 border-[2px] ${focusedInput === 'email' ? 'border-[#0EA5E9] shadow-[0_10px_30px_rgba(14,165,233,0.15)] bg-white scale-[1.02]' : 'border-[#E2E8F0] hover:border-[#BAE6FD] hover:bg-white'}`}>
                    {focusedInput === 'email' && (
                       <motion.div layoutId="input-glow" className="absolute inset-0 rounded-2xl ring-4 ring-[#0EA5E9]/20 -z-10" />
                    )}
                    <div className={`pl-5 pr-3 transition-colors duration-300 ${focusedInput === 'email' ? 'text-[#0EA5E9]' : 'text-[#94A3B8]'}`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full bg-transparent !border-none !border-transparent text-[#0F172A] text-[15px] font-bold !focus:ring-0 !focus:outline-none !focus:border-transparent placeholder-[#CBD5E1] py-4 pr-5 outline-none shadow-none ring-0 focus:ring-transparent focus:shadow-none"
                      placeholder="name@organization.com"
                      required
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      style={{ boxShadow: 'none' }}
                    />
                    {email.length > 5 && email.includes('@') && (
                      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="pr-5">
                        <CheckCircle2 className="w-5 h-5 text-[#0EA5E9]" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Animated Password Input */}
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center pl-1 pr-1">
                    <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest">Password</label>
                    <a href="#" className="text-[11px] font-bold text-[#0EA5E9] hover:text-[#0284C7] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#0EA5E9] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-right hover:after:origin-left">
                      Recover Access
                    </a>
                  </div>
                  
                  <div className={`relative flex items-center bg-[#F8FAFC] rounded-2xl transition-all duration-300 border-[2px] ${focusedInput === 'password' ? 'border-[#0EA5E9] shadow-[0_10px_30px_rgba(14,165,233,0.15)] bg-white scale-[1.02]' : 'border-[#E2E8F0] hover:border-[#BAE6FD] hover:bg-white'}`}>
                    {focusedInput === 'password' && (
                       <motion.div layoutId="input-glow" className="absolute inset-0 rounded-2xl ring-4 ring-[#0EA5E9]/20 -z-10" />
                    )}
                    <div className={`pl-5 pr-3 transition-colors duration-300 ${focusedInput === 'password' ? 'text-[#0EA5E9]' : 'text-[#94A3B8]'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full bg-transparent !border-none !border-transparent text-[#0F172A] text-[15px] font-black !focus:ring-0 !focus:outline-none !focus:border-transparent placeholder-[#CBD5E1] py-4 pr-5 outline-none shadow-none ring-0 focus:ring-transparent focus:shadow-none tracking-[0.2em]"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      style={{ boxShadow: 'none' }}
                    />
                  </div>
                </div>

                {/* Premium Animated Submit Button */}
                <div className="pt-8">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.03 } : {}}
                    whileTap={!loading ? { scale: 0.97 } : {}}
                    className={`
                      relative w-full py-5 rounded-2xl text-[15px] font-black text-white 
                      transition-all overflow-hidden flex items-center justify-center group
                      ${loading ? 'bg-[#94A3B8] cursor-not-allowed' : 'bg-[#0F172A] hover:bg-[#1E293B] shadow-[0_15px_35px_rgba(15,23,42,0.3)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.4)]'}
                    `}
                  >
                    {/* Inner light sweep */}
                    {!loading && (
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_ease-out] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]" />
                    )}
                    
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" />
                      </div>
                    ) : (
                      <>
                        <span className="tracking-wider uppercase text-[13px] relative z-10">Authenticate</span>
                        <ArrowRight className="w-5 h-5 ml-3 opacity-90 transition-transform group-hover:translate-x-2 relative z-10" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
            
            {/* Bottom Graphic */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0EA5E9] to-transparent opacity-50" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
