import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Landmark, GraduationCap, Users, Globe, Medal, Shield, Target, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import logo from '../../assets/logo.png';
import heroBg from '../../assets/hero_bg.png';
import progArts from '../../assets/programs/prog_arts.png';
import progBusiness from '../../assets/programs/prog_business.png';
import progEngineering from '../../assets/programs/prog_engineering.png';
import progSciences from '../../assets/programs/prog_sciences.png';
import progEducation from '../../assets/programs/prog_education.png';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-yellow-200">
      


      {/* Main Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <section 
        className="relative pt-32 md:pt-40 pb-32 md:pb-52 px-6 bg-cover bg-center min-h-[70vh] md:min-h-[85vh] flex items-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Dark Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/60 to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full flex justify-between items-center mt-12">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl text-white"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">
              Empowering Minds.<br/>
              <span className="text-yellow-500">Securing Futures.</span>
            </h1>
            
            <div className="w-16 h-1 bg-yellow-500 mb-6"></div>
            
            <p className="text-lg text-slate-200 mb-10 leading-relaxed font-light">
              At EduChain Zambia, we secure academic credentials for the nation's leading institutions, empowering students and ensuring absolute transparency through immutable blockchain technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <button className="bg-yellow-500 text-slate-900 px-8 py-4 rounded-md font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
                  Explore Platform <span>→</span>
                </button>
              </Link>
              <button className="border border-white text-white px-8 py-4 rounded-md font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
                View Documentation <span>▻</span>
              </button>
            </div>
          </motion.div>



        </div>
      </section>

      {/* Floating Stats Banner */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 -mt-24 mb-16">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/10 p-10 grid grid-cols-2 lg:grid-cols-5 gap-8 border border-slate-100 items-start">
          <Stat 
            icon={Landmark}
            value="15+" 
            title="Partner Institutions" 
            desc="Leading universities across Zambia." 
          />
          <Stat 
            icon={GraduationCap}
            value="85+" 
            title="Degree Programs" 
            desc="Wide range of programs secured." 
          />
          <Stat 
            icon={Users}
            value="50,000+" 
            title="Verified Students" 
            desc="A growing network of graduates." 
          />
          <Stat 
            icon={Globe}
            value="100%" 
            title="Data Immutability" 
            desc="Zero risk of tampering." 
          />
          <Stat 
            icon={Medal}
            value="Top 1" 
            title="Security Framework" 
            desc="Recognized for excellence." 
          />
        </div>
      </section>

      {/* Programs Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-100 flex flex-col xl:flex-row gap-12 items-center xl:items-start overflow-hidden">
        {/* Left Column (Text) */}
        <div className="w-full xl:w-1/4 pt-4 flex-shrink-0">
          <h4 className="text-sm font-bold text-yellow-600 tracking-widest uppercase mb-4">Secured Programs</h4>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Find Your Path</h2>
          <div className="w-12 h-1 bg-yellow-500 mb-6"></div>
          <p className="text-slate-600 leading-relaxed mb-8">
            Discover blockchain-secured programs across top Zambian universities designed to challenge you, support you, and set you up for success.
          </p>
          <Link to="/login" className="font-semibold text-slate-900 hover:text-yellow-600 transition-colors flex items-center gap-2">
            View All Programs <span>→</span>
          </Link>
        </div>

        {/* Right Column (Cards Carousel) */}
        <div className="w-full xl:w-3/4 flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <ProgramCard image={progArts} title="Arts & Humanities" />
          <ProgramCard image={progBusiness} title="Business" />
          <ProgramCard image={progEngineering} title="Engineering" />
          <ProgramCard image={progSciences} title="Sciences" />
          <ProgramCard image={progEducation} title="Education" />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-slate-50 py-24 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h4 className="text-sm font-bold text-yellow-600 tracking-widest uppercase mb-4">The EduChain Advantage</h4>
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Why Choose Us?</h2>
            <div className="w-12 h-1 bg-yellow-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-yellow-600">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tamper-Proof Records</h3>
              <p className="text-slate-600 leading-relaxed">
                By leveraging cryptographic hashing, every degree and certificate is permanently secured against fraud or unauthorized modification.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-yellow-600">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Contract Grading</h3>
              <p className="text-slate-600 leading-relaxed">
                Our automated verification systems remove human bias, ensuring every student is evaluated with 100% fairness and absolute transparency.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-yellow-600">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Global Verification</h3>
              <p className="text-slate-600 leading-relaxed">
                Employers worldwide can verify Zambian credentials instantly without relying on slow third-party registries or manual processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
        <p>© 2026 EduChain Zambia. All rights reserved.</p>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}

function Stat({ icon: Icon, value, title, desc }) {
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
      <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-slate-700 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{value}</h3>
      <h4 className="text-sm font-bold text-slate-700 mb-2">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function ProgramCard({ image, title }) {
  return (
    <div className="min-w-[280px] sm:min-w-[320px] snap-start flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 w-full bg-slate-200">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="p-5 border-t border-slate-100">
        <h3 className="font-bold text-slate-900 text-base">{title}</h3>
      </div>
    </div>
  );
}
