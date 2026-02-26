"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Globe,
  Wind,
  Database,
  UserCheck,
  Lock,
  ChevronRight,
  Play,
  CheckCircle2,
  Search,
  Satellite,
  Mail,
  Users,
  MessageSquare,
  Trophy,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<'citizen' | 'expert' | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleLogin = (role: 'citizen' | 'expert') => {
    setLoginRole(role);
    localStorage.setItem("userRole", role);
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Database className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic text-slate-900">Mechovate</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition">Methodology</a>
          <a href="#community" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition">Collective</a>
          <a href="#network" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition">Global Network</a>
          <a href="http://localhost:8001/docs" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition">Open API</a>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setLoginRole('citizen'); setIsLoginModalOpen(true); }}
            className="hidden sm:block text-sm font-bold text-slate-600 hover:text-indigo-600 transition"
          >
            Public Access
          </button>
          <Button
            onClick={() => { setLoginRole('expert'); setIsLoginModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
          >
            Expert Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Live Global Environmental Feed</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
              Bridging the gap between <span className="text-indigo-600">Citizens</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Scientists</span>.
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
              Mechovate is the premier planetary data synthesis platform. We leverage hyper-local human observations and satellite telemetry to build a real-time digital twin of Earth's environmental health.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                onClick={() => { setLoginRole('expert'); setIsLoginModalOpen(true); }}
                className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 transition-all hover:-translate-y-1"
              >
                Apply as Expert <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/dashboard"}
                className="h-14 px-8 border-slate-200 hover:bg-white text-slate-700 rounded-2xl font-black uppercase tracking-widest transition-all"
              >
                View Global Map
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-200/50 p-4 border border-slate-100 overflow-hidden group">
              <div className="aspect-[4/3] rounded-[1.5rem] bg-slate-900 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200"
                  alt="Global Data Visualization"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/20 transition group-hover:scale-110">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="space-y-2">
                    <p className="text-white font-bold text-xl uppercase tracking-tighter">Planetary Pulse v4.2</p>
                    <p className="text-slate-400 text-xs font-medium italic">Click to view the Global Trends synthesis movie</p>
                  </div>
                  <div className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Live Feed</div>
                </div>
              </div>
            </div>
            {/* Floating Stats */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden lg:block animate-bounce-subtle">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">14.2k</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Records</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Partitioning Section */}
      <section id="roles" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Unified Ecosystem</h2>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">Two Paths, One Collective Mission</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Citizen Path */}
            <div className="group bg-slate-50 rounded-[2.5rem] p-12 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 border border-indigo-50 shadow-sm group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-indigo-600" />
              </div>
              <h4 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Public Citizen Portal</h4>
              <ul className="space-y-4 mb-10 text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Browse validated environmental data packages freely.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Visualize global trends through the Interactive Spatial Monitor.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Contribute basic observations for independent ML-assisted verification.</span>
                </li>
              </ul>
              <Button
                onClick={() => { setLoginRole('citizen'); setIsLoginModalOpen(true); }}
                variant="outline"
                className="w-full h-14 border-indigo-200 text-indigo-600 rounded-2xl font-black uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"
              >
                Access Public Dashboard
              </Button>
            </div>

            {/* Expert Path */}
            <div className="group bg-[#0F172A] rounded-[2.5rem] p-12 border border-slate-800 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <h4 className="text-3xl font-black text-white mb-6 tracking-tight">Expert Contributor Hub</h4>
              <ul className="space-y-4 mb-10 text-slate-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>High-trust contribution rights with priority data discovery.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Access to Human-In-The-Loop (HITL) validation interface.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Advanced satellite cross-reference analytics for anomaly auditing.</span>
                </li>
              </ul>
              <Button
                onClick={() => { setLoginRole('expert'); setIsLoginModalOpen(true); }}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-900 border-none transition-all"
              >
                {loginRole === 'expert' ? 'Dashboard Active' : 'Login to Contributor Hub'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-24 bg-slate-900 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -ml-64 -mb-64" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
                <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Heart of the Ecosystem</span>
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter leading-tight">
                The Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Volunteer Collective</span>.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                Mechovate is more than a tool—it's a movement. Thousands of volunteers collaborate in real-time to solve environmental mysteries, peer-review data, and ensure planetary truth is accessible to all.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex -space-x-3 overflow-hidden">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img
                      key={i}
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-900 bg-slate-800"
                      src={`https://i.pravatar.cc/100?u=vol-${i}`}
                      alt={`Volunteer ${i}`}
                    />
                  ))}
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 ring-2 ring-slate-900 text-[10px] font-bold text-white">
                    +4k
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-bold text-white">Join 4,281 Activists</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active in 124 Countries</span>
                </div>
              </div>

              <Button
                onClick={() => window.location.href = "/community"}
                className="h-14 px-8 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black uppercase tracking-widest transition-all mt-4"
              >
                Enter Community Hub
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-indigo-400" />
                </div>
                <h5 className="text-lg font-black text-white mb-2 tracking-tight">Regional Circles</h5>
                <p className="text-sm text-slate-400 leading-relaxed">Local forums to discuss anomalies and coordinate hyper-local validation missions.</p>
              </div>

              <div className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <h5 className="text-lg font-black text-white mb-2 tracking-tight">Peer Auditing</h5>
                <p className="text-sm text-slate-400 leading-relaxed">Crowdsourced review protocols to enhance machine learning confidence scores.</p>
              </div>

              <div className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] hover:bg-white/10 transition-colors group sm:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                    <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Global Ranking System</span>
                  </div>
                </div>
                <h5 className="text-lg font-black text-white mb-2 tracking-tight">Clarity Points & Recognition</h5>
                <p className="text-sm text-slate-400 leading-relaxed">Earn verified credentials and visibility for discovering high-impact environmental anomalies through rigorous data submission.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal Simulation */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
            {/* Modal Header */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 ${loginRole === 'expert' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'} rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                {loginRole === 'expert' ? <ShieldCheck className="w-8 h-8" /> : <UserCheck className="w-8 h-8" />}
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {loginRole === 'expert' ? 'Expert Authorization' : 'Portal Access'}
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                {loginRole === 'expert' ? 'Verified Environmental Volunteer Login' : 'Enter the public planetary trends dashboard'}
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Network Identity</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="your@institute.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-indigo-500"
                  />
                </div>
              </div>
              <Button
                onClick={() => handleLogin(loginRole || 'citizen')}
                className={`w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all mt-4 ${loginRole === 'expert' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
              >
                Synchronize & Enter
              </Button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center pt-8 border-t border-slate-50">
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition"
              >
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Features Preview */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          {[
            { title: "Iso-Forest Anomaly Detection", icon: Database, desc: "Machine learning ensembles cross-reference user data with local historical clusters to identify statistical deviations." },
            { title: "Global Ground Truth", icon: Satellite, desc: "Integrated verification with OpenAQ land stations and iNaturalist biological datasets." },
            { title: "HITL Verification Protocol", icon: UserCheck, desc: "High-trust 'Human-In-The-Loop' workflows ensure that outliers from experts are audited for new pattern discovery." }
          ].map((f, i) => (
            <div key={i} className="space-y-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 border border-slate-200 shadow-sm">
                <f.icon className="w-6 h-6" />
              </div>
              <h5 className="font-black text-slate-900 uppercase tracking-tight">{f.title}</h5>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Resource Ecosystem */}
      <section id="resources" className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full mb-4">Ecosystem</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Connected Ground Truth</h2>
            <p className="text-slate-500 max-w-2xl text-sm">We aggregate data from the worlds most trusted open environmental networks to validate citizen reports.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
            <a href="https://openaq.org" target="_blank" className="hover:scale-110 transition-transform font-bold text-slate-400">OpenAQ</a>
            <a href="https://www.inaturalist.org" target="_blank" className="hover:scale-110 transition-transform font-bold text-slate-400">iNaturalist</a>
            <a href="https://thingspeak.com" target="_blank" className="hover:scale-110 transition-transform font-bold text-slate-400">ThingSpeak</a>
            <a href="https://opensustain.tech" target="_blank" className="hover:scale-110 transition-transform font-bold text-slate-400">OpenSustain</a>
            <a href="https://participatorysciences.org" target="_blank" className="hover:scale-110 transition-transform font-bold text-slate-400">SciStarter</a>
          </div>

          <div className="mt-16 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Build with us</p>
            <div className="flex justify-center gap-4">
              <a href="https://github.com/openaq" className="text-xs text-indigo-600 hover:underline">OpenAQ GitHub</a>
              <a href="https://github.com/inaturalist" className="text-xs text-indigo-600 hover:underline">iNaturalist GitHub</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

