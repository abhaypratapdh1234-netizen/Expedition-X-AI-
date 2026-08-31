const fs = require('fs');
const file = 'c:/Users/Abhay Pratap/OneDrive/Desktop/Expedition X AI/src/pages/app/planner/ItineraryBuilder.tsx';
let content = fs.readFileSync(file, 'utf8');

// Header
content = content.replace(
  'className="text-5xl md:text-6xl font-serif font-extrabold tracking-tight text-[#1B2A4A] mb-2"',
  'className="text-5xl md:text-6xl font-serif font-black tracking-tighter text-[#111827] mb-2 drop-shadow-sm"'
);
content = content.replace(
  'className="text-[#4b5563] font-extrabold text-[17px]"',
  'className="text-[#111827] font-black text-[17px]"'
);
content = content.replace(
  'className="text-[12px] font-extrabold tracking-widest uppercase text-[#384D7E]"',
  'className="text-[12px] font-black tracking-[0.2em] uppercase text-[#111827]"'
);

// Day Cards
content = content.replace(
  /font-serif text-3xl font-extrabold text-\[\#1B2A4A\] tracking-tight/g,
  'font-serif text-3xl font-black text-[#111827] tracking-tighter drop-shadow-sm'
);
content = content.replace(
  /text-\[15px\] font-extrabold flex items-center gap-2 text-\[\#6b7280\] uppercase tracking-widest/g,
  'text-[15px] font-black flex items-center gap-2 text-[#4b5563] uppercase tracking-[0.2em]'
);

// Waypoints
content = content.replace(/font-extrabold text-\[\#1B2A4A\]/g, 'font-black text-[#111827]');
content = content.replace(/text-\[\#1B2A4A\] font-extrabold/g, 'text-[#111827] font-black');

content = content.replace(/font-extrabold text-\[\#4b5563\]/g, 'font-black text-[#111827]');
content = content.replace(/text-\[\#4b5563\] font-extrabold/g, 'text-[#111827] font-black');

// General
content = content.replace(/font-extrabold/g, 'font-black');

fs.writeFileSync(file, content);
console.log('Typography updated successfully!');
