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

  // Replace default orange hex codes with Burnt Orange
  content = content.replace(/#f97316/gi, "#FC6C26");
  content = content.replace(/#fb923c/gi, "#FC6C26");
  content = content.replace(/#ea580c/gi, "#FC6C26");
  content = content.replace(/#c2410c/gi, "#FC6C26");
  
  // Replace the specific rgba match for orange
  content = content.replace(/249,\s*115,\s*22/gi, "252, 108, 38");

  // Keep lighter colors as the light amber/orange tint
  content = content.replace(/#fdba74/gi, "#fdecd3");
  content = content.replace(/#ffedd5/gi, "#fdecd3");

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log("Updated: " + file);
    changedCount++;
  }
});

console.log("Total files updated: " + changedCount);
