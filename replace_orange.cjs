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
  let modified = false;

  const originalContent = content;

  content = content.replace(/#F2703C/gi, "#FC6C26");
  content = content.replace(/#DF6951/gi, "#FC6C26");
  content = content.replace(/242,\s*112,\s*60/g, "252, 108, 38");
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log("Updated: " + file);
    changedCount++;
  }
});

console.log("Total files updated: " + changedCount);
