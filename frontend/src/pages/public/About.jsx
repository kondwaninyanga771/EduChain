import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Shield, Target, Eye } from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import logo from '../../assets/logo.png';
import aboutBg from '../../assets/about_bg.png';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-yellow-200">
      


      {/* Main Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <section 
        className="relative pt-32 md:pt-40 pb-32 md:pb-52 px-6 bg-cover bg-center min-h-[60vh] flex items-center"
        style={{ backgroundImage: `url(${aboutBg})` }}
      >
        {/* Dark Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-slate-900/70"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full text-center mt-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">
              Our Mission
            </h1>
            <div className="w-16 h-1 bg-yellow-500 mx-auto mb-6"></div>
            <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto font-light leading-relaxed">
              We are dedicated to building a transparent, immutable, and fully verifiable academic infrastructure for Zambia using state-of-the-art blockchain technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-6 py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-center md:text-left">
          <InfoCard 
            icon={Target}
            title="Our Vision"
            desc="To eradicate academic fraud in Zambia and establish a globally recognized standard of absolute trust in educational credentials."
          />
          <InfoCard 
            icon={Shield}
            title="Our Framework"
            desc="Built on a robust Ethereum-based architecture, every grade and certificate issued through EduChain is cryptographically secured."
          />
          <InfoCard 
            icon={Eye}
            title="Total Transparency"
            desc="Empowering employers, institutions, and students with real-time verification tools that don't rely on central authorities."
          />
        </div>
      </section>

      {/* Story Section */}
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6 text-center">The Zambian Context</h2>
        <div className="prose prose-lg text-slate-600 mx-auto text-center">
          <p className="mb-6">
            In an increasingly globalized world, the integrity of academic credentials is paramount. EduChain was born from the need to secure the hard work of Zambian students against the rising tide of credential falsification.
          </p>
          <p>
            By partnering with leading universities across the nation, we are ensuring that a degree earned in Zambia carries the weight of cryptographic proof, opening doors for our graduates worldwide.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-200 text-center text-sm text-slate-500 bg-white">
        <p>© 2026 EduChain Zambia. All rights reserved.</p>
      </footer>
    </div>
  );
}

function InfoCard({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center md:items-start">
      <div className="h-16 w-16 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center justify-center mb-6 text-yellow-600 shadow-sm">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}
