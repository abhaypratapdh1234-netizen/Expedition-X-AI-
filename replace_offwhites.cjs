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

  content = content.replace(/#f8f7f4/gi, "#FFF4D6");
  content = content.replace(/#f9fafb/gi, "#FFF4D6");
  content = content.replace(/#fafaf9/gi, "#FFF4D6");
  content = content.replace(/#F5F7FA/gi, "#FFF4D6");
  content = content.replace(/#FDFDFD/gi, "#FFF4D6");
  
  // also check for bg-slate-50, bg-gray-50, etc which are off-white? 
  // Let's replace the inline off-whites for now.

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log("Updated: " + file);
    changedCount++;
  }
});

console.log("Total files updated: " + changedCount);
