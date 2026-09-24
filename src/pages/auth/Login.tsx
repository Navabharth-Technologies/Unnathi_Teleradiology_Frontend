import React, { useState } from 'react';
import { useAuthStore } from '../../app/store/useAuthStore';
import { ShieldCheck, Stethoscope, FileCheck, Users, Building, Lock, Mail, ArrowRight } from 'lucide-react';
import { useMockDb } from '../../store/useMockDb';
import { Button } from '../../components/ui/button';

const Login = () => {
  const { login } = useAuthStore();
  const { users } = useMockDb();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check in users mock db
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // For prototype purposes, accept any password if email matches, or hardcode generic accounts
    if (user) {
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role === 'Super Admin' ? 'SUPER_ADMIN' : 
              user.role === 'Manager' ? 'SUPER_ADMIN' : // Manager as super admin equivalent for hospitals if needed, or map appropriately
              user.role === 'Radiologist' ? 'RADIOLOGIST' : 
              user.role === 'Verifier' ? 'VERIFIER' : 'RECEPTION',
        hospitalId: user.hospitalId
      });
      return;
    }

    // Default prototype fallbacks if no user in DB matches exactly
    if (email === 'admin@unnathi.com') {
      login({ id: '1', name: 'Super Admin', email: 'admin@unnathi.com', role: 'SUPER_ADMIN' });
    } else if (email === 'doctor@unnathi.com') {
      login({ id: '2', name: 'Dr. Sharma', email: 'doctor@unnathi.com', role: 'RADIOLOGIST' });
    } else if (email === 'verifier@unnathi.com') {
      login({ id: '3', name: 'Dr. Gupta', email: 'verifier@unnathi.com', role: 'VERIFIER' });
    } else if (email === 'desk@unnathi.com') {
      login({ id: '4', name: 'Front Desk', email: 'desk@unnathi.com', role: 'RECEPTION' });
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 font-sans selection:bg-teal-500/30">
      {/* Left Side - Brand & Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-black">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-teal-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Unnathi Teleradiology</h1>
          </div>
          <h2 className="text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
            Next-Generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
              Diagnostic Intelligence
            </span>
          </h2>
          <p className="mt-6 text-lg text-gray-400 max-w-md font-light leading-relaxed">
            A unified, cloud-native enterprise imaging platform that brings your RIS, PACS, and reporting into a single seamless experience.
          </p>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-700 flex items-center justify-center text-xs text-white font-medium">
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-300 font-medium">
              Join <span className="text-white font-bold">500+</span> hospitals worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-24 relative z-10 bg-gray-900">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h3>
            <p className="text-gray-400 text-sm">Please enter your credentials to access the workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="admin@unnathi.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-6 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 group">
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-12 text-center lg:text-left">
            <p className="text-xs text-gray-600 font-medium">
              Internal Prototype v1.0.0 &middot; Highly Confidential
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
