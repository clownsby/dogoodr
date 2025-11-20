import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

// --- CONFIGURATION ---
// REPLACE with your actual keys!
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; 
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [flash, setFlash] = useState(null); // 'pass' or 'match'

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('jobs').select('*').limit(20);
      setJobs(data || []);
    }
    load();
  }, []);

  const handleSwipe = (id, direction, link) => {
    // 1. Trigger the Flash Animation
    setFlash(direction === 'right' ? 'match' : 'pass');
    setTimeout(() => setFlash(null), 600); // Clear flash after animation

    // 2. Open Link if Right Swipe
    if (direction === 'right' && link) {
      // Small delay to let the user see the "Heart" animation first
      setTimeout(() => window.open(link, '_blank'), 300);
    }

    // 3. Remove Card
    setJobs(current => current.filter(j => j.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center overflow-hidden font-sans relative">
      
      {/* --- FULL SCREEN FLASH EFFECTS --- */}
      <AnimatePresence>
        {flash === 'pass' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-500 z-50 pointer-events-none flex items-center justify-center"
          >
             <span className="text-white font-black text-6xl">NOPE</span>
          </motion.div>
        )}
        {flash === 'match' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-green-500 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
          >
             {/* Floating Hearts Animation */}
             <div className="absolute inset-0 flex items-center justify-center">
               {[...Array(10)].map((_, i) => (
                 <motion.div
                   key={i}
                   initial={{ y: 0, opacity: 1, scale: 0.5 }}
                   animate={{ y: -500, opacity: 0, scale: 1.5 }}
                   transition={{ duration: 1, delay: i * 0.1 }}
                   className="absolute text-6xl"
                   style={{ left: `${Math.random() * 100}%`, top: '60%' }}
                 >
                   ❤️
                 </motion.div>
               ))}
             </div>
             <span className="text-white font-black text-6xl z-10">MATCH!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CARD STACK --- */}
      <div className="relative w-full max-w-md h-[600px] p-4 z-10">
        <AnimatePresence>
          {jobs.map((job, index) => (
            <SwipeCard 
              key={job.id} 
              job={job} 
              active={index === jobs.length - 1} // Only top card is active
              onSwipe={(dir) => handleSwipe(job.id, dir, job.link)} 
            />
          ))}
        </AnimatePresence>
        
        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="text-4xl mb-2">🎉</div>
            <p>No more jobs! Check back tomorrow.</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-teal-500 font-bold">Refresh</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- THE CARD COMPONENT ---
function SwipeCard({ job, onSwipe, active }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  
  // Gradient Opacity Mapping
  // 0 to 150px (Right) -> Green Opacity 0 to 1
  // 0 to -150px (Left) -> Red Opacity 0 to 1
  const greenOpacity = useTransform(x, [20, 150], [0, 1]);
  const redOpacity = useTransform(x, [-20, -150], [0, 1]);

  const handleDragEnd = (e, info) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) onSwipe('right');
    else if (info.offset.x < -swipeThreshold) onSwipe('left');
  };

  return (
    <motion.div
      style={{ x, rotate, zIndex: active ? 10 : 1 }}
      drag={active ? "x" : false} // Only drag top card
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute top-0 left-0 w-full h-full bg-white rounded-3xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing border border-slate-200"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: 0, scale: 0, opacity: 0 }} // Shrink away
      whileDrag={{ scale: 1.05 }}
    >
      {/* --- DYNAMIC OVERLAYS --- */}
      {/* Green Overlay (Right Swipe) */}
      <motion.div 
        style={{ opacity: greenOpacity }}
        className="absolute inset-0 bg-gradient-to-r from-transparent to-green-500/50 z-20 pointer-events-none flex items-center justify-center"
      >
        <div className="border-4 border-green-500 text-green-600 font-black text-4xl uppercase tracking-widest px-4 py-2 rounded-lg transform -rotate-12 bg-white/80 backdrop-blur-sm">
          APPLY
        </div>
      </motion.div>

      {/* Red Overlay (Left Swipe) */}
      <motion.div 
        style={{ opacity: redOpacity }}
        className="absolute inset-0 bg-gradient-to-l from-transparent to-red-500/50 z-20 pointer-events-none flex items-center justify-center"
      >
        <div className="border-4 border-red-500 text-red-600 font-black text-4xl uppercase tracking-widest px-4 py-2 rounded-lg transform rotate-12 bg-white/80 backdrop-blur-sm">
          PASS
        </div>
      </motion.div>

      {/* --- CARD CONTENT --- */}
      <div className="p-8 flex flex-col h-full justify-between relative z-10">
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {job.tags?.map((tag, i) => (
              <span key={i} className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full border border-teal-200">
                {tag}
              </span>
            ))}
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2 leading-tight">{job.title}</h2>
          <p className="text-slate-500 font-bold mb-4 text-lg">{job.org_name}</p>
          <div className="w-full h-px bg-slate-100 mb-4" />
          <p className="text-slate-600 leading-relaxed line-clamp-6 text-lg">
            {job.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4">
          <button 
            onClick={() => onSwipe('left')} 
            className="w-16 h-16 bg-white rounded-full shadow-lg border border-slate-100 text-red-500 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <button 
            onClick={() => on
