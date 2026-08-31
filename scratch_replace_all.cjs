const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Abhay Pratap/OneDrive/Desktop/Expedition X AI/src/pages/app/planner';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const f of files) {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if it doesn't have font-extrabold and no specific updates are needed
  if (!content.includes('font-extrabold')) continue;

  // Header / Title elements
  content = content.replace(
    /className="text-5xl md:text-6xl font-serif font-extrabold tracking-tight text-\[\#1B2A4A\] mb-2"/g,
    'className="text-5xl md:text-6xl font-serif font-black tracking-tighter text-[#111827] mb-2 drop-shadow-sm"'
  );
  content = content.replace(
    /className="text-\[\#4b5563\] font-extrabold text-\[17px\]"/g,
    'className="text-[#111827] font-black text-[17px]"'
  );

  // Common UI elements
  content = content.replace(/font-extrabold text-\[\#1B2A4A\]/g, 'font-black text-[#111827]');
  content = content.replace(/text-\[\#1B2A4A\] font-extrabold/g, 'text-[#111827] font-black');

  content = content.replace(/font-extrabold text-\[\#4b5563\]/g, 'font-black text-[#111827]');
  content = content.replace(/text-\[\#4b5563\] font-extrabold/g, 'text-[#111827] font-black');

  // Everything else
  content = content.replace(/font-extrabold/g, 'font-black');

  fs.writeFileSync(filePath, content);
}
console.log('All planner files updated.');
