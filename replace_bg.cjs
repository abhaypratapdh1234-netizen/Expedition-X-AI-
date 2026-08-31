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
      if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
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
  let modified = false;

  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("min-h-screen")) {
      if (lines[i].includes("bg-white")) {
        lines[i] = lines[i].replace(/bg-white/g, "bg-[#FFF4D6]");
        modified = true;
      }
      if (lines[i].match(/style=\{\{\s*background:\s*['"][^'"]+['"]\s*\}\}/)) {
        lines[i] = lines[i].replace(/style=\{\{\s*background:\s*['"][^'"]+['"]\s*\}\}/g, "style={{ background: '" + "#FFF4D6" + "' }}");
        modified = true;
      }
      if (lines[i].match(/bg-\[#[a-fA-F0-9]+\]/)) {
        lines[i] = lines[i].replace(/bg-\[#[a-fA-F0-9]+\]/g, "bg-[#FFF4D6]");
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(file, lines.join("\n"));
    console.log("Updated: " + file);
    changedCount++;
  }
});

console.log("Total files updated: " + changedCount);
