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

  // Additional old orange variants
  content = content.replace(/#F68B5E/gi, "#FC6C26");
  content = content.replace(/#F9A784/gi, "#FC6C26");
  content = content.replace(/#FCEEDD/gi, "#FC6C26");
  
  // Hover states of the old orange
  content = content.replace(/#e0612f/gi, "#E5591A");
  content = content.replace(/#cc5b43/gi, "#E5591A");
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log("Updated: " + file);
    changedCount++;
  }
});

console.log("Total files updated: " + changedCount);
