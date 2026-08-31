const fs = require('fs'); 
const path = 'c:/Users/Abhay Pratap/OneDrive/Desktop/Expedition X AI/src/pages/app/planner/ItineraryBuilder.tsx'; 
let content = fs.readFileSync(path, 'utf8'); 

content = content.replace(/text-\[(\d+)px\]/g, (match, p1) => { 
    return `text-[${parseInt(p1) + 1}px]`; 
}); 

content = content.replace(/font-medium/g, 'font-extrabold'); 
content = content.replace(/font-bold/g, 'font-extrabold'); 
content = content.replace(/text-gray-600/g, 'text-[#4b5563]'); 
content = content.replace(/text-4xl md:text-5xl/g, 'text-5xl md:text-6xl'); 
content = content.replace(/text-4xl/g, 'text-5xl'); 
content = content.replace(/text-2xl leading-none/g, 'text-3xl font-extrabold leading-none'); 
content = content.replace(/font-serif text-2xl/g, 'font-serif text-3xl'); 
content = content.replace(/text-3xl font-extrabold font-bold/g, 'text-3xl font-extrabold');

fs.writeFileSync(path, content);
