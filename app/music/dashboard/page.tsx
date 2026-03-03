"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  ChevronRight, 
  Play, 
  Clock, 
  Calendar,
  Trophy,
  Users,
  Star,
  ExternalLink
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";

const stats = [
  { icon: Users, label: "Total Interviews", value: "10K+", color: "bg-blue-500/10 text-blue-500" },
  { icon: Trophy, label: "Success Rate", value: "95%", color: "bg-emerald-500/10 text-emerald-500" },
  { icon: Star, label: "Avg Rating", value: "4.9/5", color: "bg-amber-500/10 text-amber-500" },
];

const myInterviews = [
  { id: 1, title: "Frontend Developer", date: "Oct 12, 2023", score: "88/100", status: "Completed" },
  { id: 2, title: "React Specialist", date: "Oct 15, 2023", score: "--", status: "Pending" },
  { id: 3, title: "UI/UX Designer", date: "Oct 18, 2023", score: "92/100", status: "Completed" },
];

const availableInterviews = [
  { id: 1, title: "Backend Engineer", level: "Expert", duration: "45 mins", creator: "AI Engine" },
  { id: 2, title: "Fullstack Manager", level: "Senior", duration: "60 mins", creator: "Tech Team" },
  { id: 3, title: "DevOps Architect", level: "Master", duration: "50 mins", creator: "Cloud AI" },
];

export default function MusicDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex selection:bg-orange-500/30">
      <DashboardSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main 
        className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-0 lg:ml-64"}`}
      >
        {/* Top Navigation */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-[#1a1a1a] sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-40">
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search interviews, roles, or metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111] border border-[#222] rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end hidden md:block">
                <span className="text-sm font-semibold text-white">Aditya Sharma</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Premium User</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#111] border border-[#222] p-0.5 group cursor-pointer overflow-hidden">
                <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-orange-400 to-rose-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                    AS
                </div>
            </div>
          </div>
        </header>

        <motion.div 
          className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Section */}
          <section className="space-y-8">
            <div className="space-y-2">
                <motion.h1 
                  variants={cardVariants}
                  className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                >
                  Welcome back, Aditya
                </motion.h1>
                <motion.p 
                  variants={cardVariants}
                  className="text-gray-500 text-lg font-medium"
                >
                  Your personalized AI interview companion is ready. Let's sharpen those skills.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  className="bg-[#0f0f0f] border border-[#1a1a1a] p-6 rounded-[32px] flex items-center gap-6 hover:bg-[#151515] transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color} shrink-0 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={26} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h4>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section 1: Your Interviews */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Your Interviews</h2>
                <button className="text-orange-500 text-sm font-bold flex items-center gap-1 hover:underline">
                    View Activity <ChevronRight size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myInterviews.map((interview) => (
                <motion.div
                  key={interview.id}
                  variants={cardVariants}
                  whileHover={{ y: -8 }}
                  className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[32px] p-6 space-y-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all flex flex-col"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Play size={22} fill="currentColor" />
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        interview.status === "Completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                    }`}>
                        {interview.status}
                    </span>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div>
                        <h3 className="text-[19px] font-bold text-white line-clamp-1">{interview.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-gray-500 text-xs">
                            <Calendar size={14} />
                            <span>{interview.date}</span>
                            <span className="mx-1">•</span>
                            <Clock size={14} />
                            <span>25 mins</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Overall Score</p>
                            <p className="text-xl font-bold text-white mt-1">{interview.score}</p>
                        </div>
                        <button className="px-6 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold hover:bg-white/10 transition-colors">
                            {interview.status === "Completed" ? "View Report" : "Continue"}
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section 2: Available Interviews */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Available Interviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableInterviews.map((item) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  whileHover={{ y: -8 }}
                  className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[32px] p-7 space-y-8 flex flex-col group transition-all hover:bg-gradient-to-b hover:from-[#0f0f0f] hover:to-[#1a110a]"
                >
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500/60">{item.level} Level</span>
                        <ExternalLink size={16} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
                      </div>
                      <h3 className="text-2xl font-bold text-white leading-tight">{item.title}</h3>
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {item.duration}</span>
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">By {item.creator}</span>
                      </div>
                   </div>

                   <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all hover:shadow-orange-500/40 active:scale-95">
                      Start Interview Now
                   </button>
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
