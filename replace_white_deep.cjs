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

  if (file.endsWith(".css")) {
    content = content.replace(/#FFFFFF/gi, "#FFF4D6");
    content = content.replace(/#FDFDFD/gi, "#FFF4D6");
    content = content.replace(/background:\s*white/gi, "background: #FFF4D6");
    content = content.replace(/background-color:\s*white/gi, "background-color: #FFF4D6");
  } else {
    // For TSX/JSX, replace background utility classes and inline styles
    content = content.replace(/\bbg-white\b/g, "bg-[#FFF4D6]");
    content = content.replace(/\bbg-\[#FFFFFF\]\b/gi, "bg-[#FFF4D6]");
    content = content.replace(/\bbg-\[#FDFDFD\]\b/gi, "bg-[#FFF4D6]");
    content = content.replace(/\bbg-\[#F9FAFB\]\b/gi, "bg-[#FFF4D6]");
    content = content.replace(/\bbg-\[#f8f7f4\]\b/gi, "bg-[#FFF4D6]");
    content = content.replace(/\bbg-\[#fafaf9\]\b/gi, "bg-[#FFF4D6]");
    content = content.replace(/background:\s*['"]#FFFFFF['"]/gi, "background: '#FFF4D6'");
    content = content.replace(/background:\s*['"]white['"]/gi, "background: '#FFF4D6'");
    content = content.replace(/backgroundColor:\s*['"]#FFFFFF['"]/gi, "backgroundColor: '#FFF4D6'");
    content = content.replace(/backgroundColor:\s*['"]white['"]/gi, "backgroundColor: '#FFF4D6'");
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log("Updated: " + file);
    changedCount++;
  }
});

console.log("Total files updated: " + changedCount);
