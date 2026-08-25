import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Lock, ShieldCheck, Scale, Network, Database, CheckCircle2 } from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import logo from '../../assets/logo.png';
import securityBg from '../../assets/security_bg.png';

export function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-yellow-200">
      
      {/* Main Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <section 
        className="relative pt-32 md:pt-40 pb-32 md:pb-52 px-6 bg-cover bg-center min-h-[60vh] flex items-center"
        style={{ backgroundImage: `url(${securityBg})` }}
      >
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-slate-900/80"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full text-center mt-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h4 className="text-sm font-bold text-yellow-500 tracking-widest uppercase mb-4">Uncompromising Integrity</h4>
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">
              Blockchain Security
            </h1>
            <div className="w-16 h-1 bg-yellow-500 mx-auto mb-6"></div>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
              How EduChain protects student data, guarantees fairness, and ensures every academic record remains completely tamper-proof.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className="px-6 py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-slate-700 shadow-sm">
              <Lock className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Immutability</h3>
            <p className="text-slate-600 leading-relaxed">
              Once a grade or certificate is committed to the blockchain, it becomes a permanent record. Cryptographic hashes link every block of data together, meaning it is mathematically impossible for anyone—including administrators—to alter or delete a past result.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-slate-700 shadow-sm">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Data Protection</h3>
            <p className="text-slate-600 leading-relaxed">
              Student identities and personal data are protected through advanced cryptographic hashing. Only authorized parties with the correct decryption keys can access the raw information, ensuring absolute compliance with data privacy regulations.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-slate-700 shadow-sm">
              <Scale className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Guaranteed Fairness</h3>
            <p className="text-slate-600 leading-relaxed">
              Our automated Smart Contracts execute grading logic and result processing without human intervention. By removing subjective bias and manual entry errors, every student receives a mathematically verifiable and perfectly fair assessment.
            </p>
          </div>

        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="px-6 py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
              <div className="relative z-10">
                <Network className="h-12 w-12 text-yellow-600 mb-6" />
                <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Decentralized Verification</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  In traditional systems, verifying a degree requires contacting a university registry and waiting weeks for a response. A central database is a single point of failure that can be hacked, bribed, or manipulated.
                </p>
                <p className="text-slate-600 leading-relaxed mb-8">
                  EduChain distributes the academic ledger across multiple independent nodes. When an employer wants to verify a Zambian graduate's credentials, they query the blockchain directly. The network reaches a consensus instantly, providing mathematically infallible proof of the degree in seconds.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm font-semibold text-slate-700"><CheckCircle2 className="h-5 w-5 text-yellow-500" /> No Single Point of Failure</li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-slate-700"><CheckCircle2 className="h-5 w-5 text-yellow-500" /> Instant Global Verification</li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-slate-700"><CheckCircle2 className="h-5 w-5 text-yellow-500" /> Zero Reliance on Third-Party Registries</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-8">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Why It Matters for Zambia</h2>
            <div className="w-12 h-1 bg-yellow-500 mb-8"></div>
            
            <div className="flex gap-4">
              <div className="mt-1"><Database className="h-6 w-6 text-slate-400" /></div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Eradicating Degree Mills</h4>
                <p className="text-slate-600 leading-relaxed">By moving credentials entirely to a cryptographic ledger, it becomes impossible to forge a certificate. Employers worldwide can trust Zambian degrees implicitly.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1"><ShieldCheck className="h-6 w-6 text-slate-400" /></div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Protecting Hard Work</h4>
                <p className="text-slate-600 leading-relaxed">Students spend years earning their qualifications. EduChain acts as a digital vault, ensuring their achievements can never be lost due to server crashes, fires, or administrative errors.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-200 text-center text-sm text-slate-500 bg-white">
        <p>© 2026 EduChain Zambia. All rights reserved.</p>
      </footer>
    </div>
  );
}
