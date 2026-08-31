const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (
        file.endsWith(".tsx") ||
        file.endsWith(".jsx") ||
        file.endsWith(".ts") ||
        file.endsWith(".css") ||
        file.endsWith(".js")
      ) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk("./src");
let changedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  const originalContent = content;

  // Replace utility classes
  const classesToReplace = [
    "bg-gray-50", "bg-gray-100",
    "bg-slate-50", "bg-slate-100",
    "bg-zinc-50", "bg-zinc-100",
    "bg-neutral-50", "bg-neutral-100",
    "bg-stone-50", "bg-stone-100",
    "bg-teal-50", "bg-blue-50", "bg-indigo-50",
    "bg-orange-50", "bg-amber-50", "bg-yellow-50", "bg-red-50", "bg-rose-50",
    "bg-\\[#f3f4f6\\]", "bg-\\[#f1f5f9\\]", "bg-\\[#f8fafc\\]",
    "bg-\\[#fafafa\\]", "bg-\\[#f5f5f5\\]", "bg-\\[#F5F7FA\\]",
    "bg-\\[#e2e8f0\\]", "bg-\\[#e5e7eb\\]", "bg-\\[#f4f4f5\\]"
  ];

  classesToReplace.forEach(cls => {
    // using regex to match exact word boundary
    const regex = new RegExp(`\\b${cls}\\b`, "gi");
    content = content.replace(regex, "bg-[#FFF4D6]");
  });

  // Replace inline styles
  content = content.replace(/background:\s*['"]#(f3f4f6|f1f5f9|f8fafc|fafafa|f5f5f5|F5F7FA|e2e8f0|e5e7eb)['"]/gi, "background: '#FFF4D6'");
  content = content.replace(/backgroundColor:\s*['"]#(f3f4f6|f1f5f9|f8fafc|fafafa|f5f5f5|F5F7FA|e2e8f0|e5e7eb)['"]/gi, "backgroundColor: '#FFF4D6'");
  
  // Replace from tailwind gradients that use these colors as backgrounds
  content = content.replace(/from-\[#(f3f4f6|f1f5f9|f8fafc|fafafa|f5f5f5|F5F7FA|e2e8f0)\]/gi, "from-[#FFF4D6]");
  content = content.replace(/to-\[#(f3f4f6|f1f5f9|f8fafc|fafafa|f5f5f5|F5F7FA|e2e8f0)\]/gi, "to-[#FFF4D6]");

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log("Updated: " + file);
    changedCount++;
  }
});

console.log("Total files updated: " + changedCount);
