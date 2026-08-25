import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Calendar, ChevronRight, Newspaper } from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import logo from '../../assets/logo.png';
import newsBg from '../../assets/news_bg.png';

export function NewsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-yellow-200">
      
      {/* Main Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <section 
        className="relative pt-32 md:pt-40 pb-32 md:pb-52 px-6 bg-cover bg-center min-h-[60vh] flex items-center"
        style={{ backgroundImage: `url(${newsBg})` }}
      >
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-slate-900/80"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full text-center mt-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h4 className="text-sm font-bold text-yellow-500 tracking-widest uppercase mb-4">Stay Informed</h4>
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">
              News & Events
            </h1>
            <div className="w-16 h-1 bg-yellow-500 mx-auto mb-6"></div>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
              Discover the latest announcements, platform upgrades, and academic events across the EduChain Zambia network.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="px-6 py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-16">
          
          {/* Latest News Column */}
          <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center gap-3 mb-8">
              <Newspaper className="h-6 w-6 text-yellow-600" />
              <h2 className="text-3xl font-serif font-bold text-slate-900">Latest Announcements</h2>
            </div>

            <ArticleCard 
              date="October 12, 2026"
              title="EduChain Partners with University of Zambia"
              excerpt="In a landmark agreement, the University of Zambia will begin issuing all graduate degrees directly onto the EduChain cryptographic ledger starting next semester."
              category="Partnership"
            />
            
            <ArticleCard 
              date="September 28, 2026"
              title="Government Endorses Blockchain Verification"
              excerpt="The Ministry of Higher Education has officially endorsed EduChain as the standard for verifying academic credentials for public sector employment in Zambia."
              category="Policy"
            />
            
            <ArticleCard 
              date="September 15, 2026"
              title="Smart Contract Upgrade: Automated Grading Version 2.0"
              excerpt="We have successfully deployed the v2.0 smart contract, introducing advanced zero-knowledge proofs to further protect student anonymity during the grading process."
              category="Technology"
            />

            <button className="font-semibold text-slate-900 hover:text-yellow-600 transition-colors flex items-center gap-2 mt-8">
              View All News Articles <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Upcoming Events Column */}
          <div className="lg:col-span-1">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <Calendar className="h-6 w-6 text-yellow-600" />
                <h2 className="text-2xl font-serif font-bold text-slate-900">Upcoming Events</h2>
              </div>

              <div className="space-y-6">
                <EventCard 
                  date="Nov 05"
                  title="EduChain Developer Hackathon"
                  location="Lusaka Innovation Hub"
                />
                <EventCard 
                  date="Nov 18"
                  title="Blockchain in Education Seminar"
                  location="Copperbelt University Campus"
                />
                <EventCard 
                  date="Dec 01"
                  title="2027 Enrollment Deadlines"
                  location="All Partner Institutions"
                />
              </div>

              <button className="w-full mt-8 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 hover:border-yellow-500 hover:text-yellow-600 transition-all text-sm">
                Full Events Calendar
              </button>
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

function ArticleCard({ date, title, excerpt, category }) {
  return (
    <article className="group cursor-pointer">
      <div className="flex items-center gap-4 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">{category}</span>
        <span className="text-sm font-medium text-slate-400">{date}</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-yellow-600 transition-colors">{title}</h3>
      <p className="text-slate-600 leading-relaxed mb-4">{excerpt}</p>
      <div className="w-full h-px bg-slate-100 mt-8 group-last:hidden"></div>
    </article>
  );
}

function EventCard({ date, title, location }) {
  return (
    <div className="flex gap-4 group cursor-pointer hover:bg-white p-3 -ml-3 rounded-xl transition-colors">
      <div className="flex-shrink-0 w-14 h-14 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white">
        <span className="text-xs font-medium uppercase opacity-80">{date.split(' ')[0]}</span>
        <span className="text-lg font-bold">{date.split(' ')[1]}</span>
      </div>
      <div>
        <h4 className="font-bold text-slate-900 group-hover:text-yellow-600 transition-colors">{title}</h4>
        <p className="text-sm text-slate-500 mt-1">{location}</p>
      </div>
    </div>
  );
}
