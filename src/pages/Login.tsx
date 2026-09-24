import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { type Role } from '../types';
import logoImg from '../assets/unnathi-logo-light.svg';
import { ArrowRight, Lock, User, ShieldCheck } from 'lucide-react';
import { useMockDb } from '../store/useMockDb';

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const { users } = useMockDb();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        login({ id: user.id, name: user.name, email: user.email, role: user.role, hospitalId: user.hospitalId, siteId: user.siteId });
      } else {
        alert('Invalid credentials');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#020817] font-sans selection:bg-[#00A8CC]/30">
      
      {/* Dynamic Animated "Creatures" (Blobs) & Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay"></div>
        
        {/* Animated Blob 1 */}
        <div 
          className="absolute top-1/4 -left-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-r from-[#00A8CC]/30 to-[#00A8CC]/5 blur-[120px] mix-blend-screen"
          style={{ 
            animation: 'float-slow 20s ease-in-out infinite alternate',
            transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`
          }}
        ></div>

        {/* Animated Blob 2 */}
        <div 
          className="absolute -bottom-[20%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-l from-indigo-600/20 to-purple-600/10 blur-[150px] mix-blend-screen"
          style={{ 
            animation: 'float-medium 25s ease-in-out infinite alternate-reverse',
            transform: `translate(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px)`
          }}
        ></div>

        {/* Animated Blob 3 */}
        <div 
          className="absolute top-[-10%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-emerald-500/10 blur-[100px] mix-blend-screen"
          style={{ 
            animation: 'float-fast 15s ease-in-out infinite alternate',
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
        
        {/* Left Side - Brand & Value Prop */}
        <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="mb-12 relative group inline-block animate-in slide-in-from-bottom-8 fade-in duration-1000 ease-out fill-mode-both">
            <div className="absolute -inset-8 bg-gradient-to-r from-[#00A8CC]/30 via-indigo-500/20 to-transparent blur-3xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <img src={logoImg} alt="Unnathi Teleradiology" className="h-16 lg:h-24 object-contain relative drop-shadow-[0_0_25px_rgba(0,168,204,0.4)] transition-transform duration-1000 hover:scale-105" />
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6 drop-shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300 ease-out fill-mode-both">
            The Future of <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A8CC] via-cyan-300 to-indigo-400 animate-gradient-x relative inline-block">
              Teleradiology
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#00A8CC] to-transparent rounded-full opacity-50 blur-[2px]"></div>
            </span>
          </h1>
          
          <p className="text-slate-300 text-lg lg:text-xl font-medium max-w-lg mb-8 leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500 ease-out fill-mode-both">
            Experience a seamless, AI-powered enterprise imaging network. We connect hospitals, radiologists, and patients with zero latency and bank-grade security.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-700 ease-out fill-mode-both">
            <div className="flex -space-x-4 hover:space-x-1 transition-all duration-500 cursor-pointer">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-12 h-12 rounded-full border-[3px] border-[#020817] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-2 ${i === 1 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 z-30' : i === 2 ? 'bg-gradient-to-br from-[#00A8CC] to-cyan-600 z-20' : 'bg-gradient-to-br from-emerald-400 to-teal-600 z-10'}`}>
                  <ShieldCheck className="w-5 h-5 text-white/90" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-400 tracking-wide">
                Trusted by <span className="text-white">500+</span> Healthcare Centers
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">ISO 27001 & HIPAA Compliant</p>
            </div>
          </div>
        </div>

        {/* Right Side - Premium Login Card */}
        <div className="w-full max-w-md lg:max-w-lg perspective-1000">
          <div 
            className="animate-in slide-in-from-right-8 duration-1000 ease-out delay-300 fill-mode-both"
            style={{ 
              transform: `rotateX(${mousePos.y * -0.5}deg) rotateY(${mousePos.x * 0.5}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="bg-[#0b1426]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden relative group/card">
              
              {/* Card Inner Glow that follows mouse (simulated) */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00A8CC]/50 to-transparent opacity-50 group-hover/card:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#00A8CC]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              <div className="p-10 pb-0 relative z-10">
                <div className="inline-flex items-center justify-center p-3.5 bg-[#00A8CC]/10 rounded-2xl mb-6 border border-[#00A8CC]/20 shadow-[0_0_30px_rgba(0,168,204,0.15)] group-hover/card:scale-110 transition-transform duration-500">
                  <Lock className="w-6 h-6 text-[#00A8CC]" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Access Portal</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Authenticate to enter the secure workspace.</p>
              </div>

              <form onSubmit={handleLogin} className="p-10 pt-0 space-y-6 relative z-10">
                <div className="space-y-4">
                  
                  {/* Email Input */}
                  <div className="space-y-1.5 group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-[#00A8CC]">Email Address</label>
                    <div className={`relative flex items-center bg-[#050b14] border-2 rounded-2xl overflow-hidden transition-all duration-300 ${focusedInput === 'email' ? 'border-[#00A8CC] shadow-[0_0_20px_rgba(0,168,204,0.2)] bg-[#0a1222]' : 'border-white/5 hover:border-white/10'}`}>
                      <div className="pl-4 pr-3 py-4 text-slate-500 transition-colors group-focus-within:text-[#00A8CC]">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-transparent border-none text-white text-sm font-medium focus:ring-0 placeholder-slate-600 py-4 pr-4 outline-none"
                        placeholder="admin@unnathi.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5 group">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors group-focus-within:text-[#00A8CC]">Password</label>
                      <a href="#" className="text-xs font-bold text-[#00A8CC] hover:text-cyan-300 transition-colors">Forgot?</a>
                    </div>
                    <div className={`relative flex items-center bg-[#050b14] border-2 rounded-2xl overflow-hidden transition-all duration-300 ${focusedInput === 'password' ? 'border-[#00A8CC] shadow-[0_0_20px_rgba(0,168,204,0.2)] bg-[#0a1222]' : 'border-white/5 hover:border-white/10'}`}>
                      <div className="pl-4 pr-3 py-4 text-slate-500 transition-colors group-focus-within:text-[#00A8CC]">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-transparent border-none text-white text-sm font-medium focus:ring-0 placeholder-slate-600 py-4 pr-4 outline-none"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-[#008ba8] to-[#00A8CC] hover:from-[#00A8CC] hover:to-cyan-400 text-white font-bold py-4 px-6 rounded-2xl shadow-[0_10px_25px_rgba(0,168,204,0.4)] transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,168,204,0.5)] hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="flex items-center justify-center gap-2 text-[15px] tracking-wide relative z-10">
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Secure Sign In
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes float-slow {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 10%) scale(1.05); }
          100% { transform: translate(-5%, 5%) scale(0.95); }
        }
        @keyframes float-medium {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-5%, -8%) scale(1.02); }
          100% { transform: translate(3%, 5%) scale(0.98); }
        }
        @keyframes float-fast {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, -5%) scale(1.08); }
          100% { transform: translate(-3%, 8%) scale(0.92); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 4s linear infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </div>
  );
}
