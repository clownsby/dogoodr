import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://vhsyhxghiljzpngjxrwh.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_YxyC0wGDiAIwt4V4Q3zw6Q_ezD6IfS6';

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
