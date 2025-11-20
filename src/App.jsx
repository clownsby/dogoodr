function SwipeCard({ job, onSwipe }) {
  // Handle the drag end logic
  const handleDragEnd = (e, info) => {
    const swipeThreshold = 100; // How far they have to drag to count
    
    if (info.offset.x > swipeThreshold) {
      // SWIPED RIGHT (Positive X) -> APPLY
      // Open the link in a new tab
      window.open(job.link, '_blank');
      onSwipe(); // Remove card
    } 
    else if (info.offset.x < -swipeThreshold) {
      // SWIPED LEFT (Negative X) -> PASS
      // Just remove the card
      onSwipe(); 
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd} // <--- Using our new logic here
      className="absolute top-0 left-0 w-full h-full bg-white rounded-3xl shadow-xl p-8 flex flex-col justify-between cursor-grab border border-slate-200"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: 200, opacity: 0 }} // Fly off screen
      whileDrag={{ scale: 1.05, rotate: 0 }} // Little pop when grabbing
    >
      <div>
        {/* TAGS */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {job.tags?.map((tag, i) => (
            <span key={i} className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 mb-2">{job.title}</h2>
        <p className="text-slate-500 font-medium mb-4">{job.org_name}</p>
        <p className="text-slate-600 leading-relaxed line-clamp-4">
          {job.description}
        </p>
      </div>

      {/* BUTTONS (Clicking these also triggers the logic) */}
      <div className="flex gap-4">
        <button 
          onClick={onSwipe} 
          className="flex-1 bg-slate-100 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
        >
          Pass
        </button>
        <button 
          onClick={() => { window.open(job.link, '_blank'); onSwipe(); }} 
          className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold text-center hover:bg-teal-600 transition-colors"
        >
          Apply
        </button>
      </div>
    </motion.div>
  );
}
