import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

// Connect to Database (Public Key is safe here for read-only)
const supabase = createClient('https://vhsyhxghiljzpngjxrwh.supabase.co', 'sb_publishable_YxyC0wGDiAIwt4V4Q3zw6Q_ezD6IfS6');

export default function App() {
  const [jobs, setJobs] = useState([]);
  
  useEffect(() => {
    // Fetch jobs from DB on load
    async function load() {
      const { data } = await supabase.from('jobs').select('*').limit(20);
      setJobs(data || []);
    }
    load();
  }, []);

  const removeCard = (id) => setJobs(current => current.filter(j => j.id !== id));

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center overflow-hidden font-sans">
      <div className="relative w-full max-w-md h-[600px] p-4">
        <AnimatePresence>
          {jobs.map((job, index) => (
            <SwipeCard key={job.id} job={job} onSwipe={() => removeCard(job.id)} />
          ))}
        </AnimatePresence>
        {jobs.length === 0 && <div className="text-center text-slate-400 mt-20">No more jobs! Check back tomorrow.</div>}
      </div>
    </div>
  );
}

function SwipeCard({ job, onSwipe }) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => { if (Math.abs(info.offset.x) > 100) onSwipe(); }}
      className="absolute top-0 left-0 w-full h-full bg-white rounded-3xl shadow-xl p-8 flex flex-col justify-between cursor-grab border border-slate-200"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: 200, opacity: 0 }}
    >
      <div>
        <div className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">{job.tags?.[0] || 'Volunteer'}</div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">{job.title}</h2>
        <p className="text-slate-500 font-medium mb-4">{job.org_name}</p>
        <p className="text-slate-600 leading-relaxed">{job.description}...</p>
      </div>
      <div className="flex gap-4">
        <button className="flex-1 bg-slate-100 py-4 rounded-xl font-bold text-slate-500">Pass</button>
        <a href={job.link} target="_blank" className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold text-center">Apply</a>
      </div>
    </motion.div>
  );
}