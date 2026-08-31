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
        file.endsWith(".jsx")
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

  // Split into lines to do contextual replacement
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if the current block looks like a main page layout wrapper
    // We check the current line, and the lines immediately around it
    const contextStr = [
      lines[i-2], lines[i-1], line, lines[i+1], lines[i+2]
    ].join(' ');

    const isMainLayout = contextStr.includes('min-h-screen') || contextStr.includes('min-h-[100dvh]') || contextStr.includes('h-screen');
    
    if (!isMainLayout) {
      // It's likely a card or internal component
      lines[i] = lines[i].replace(/bg-\[#FFF4D6\]/gi, "bg-[#ffffff]");
      lines[i] = lines[i].replace(/'#FFF4D6'/gi, "'#ffffff'");
      lines[i] = lines[i].replace(/"#FFF4D6"/gi, '"#ffffff"');
      lines[i] = lines[i].replace(/rgba\(255,\s*244,\s*214/gi, "rgba(255, 255, 255");
    }
  }

  let newContent = lines.join('\n');
  
  if (newContent !== originalContent) {
    fs.writeFileSync(file, newContent);
    console.log("Updated cards to white in: " + file);
    changedCount++;
  }
});

// Also revert globals.css variables for cards
const globalsPath = "./src/styles/globals.css";
if (fs.existsSync(globalsPath)) {
  let globals = fs.readFileSync(globalsPath, "utf8");
  globals = globals.replace(/--bg-card:\s*#FFF4D6;/gi, "--bg-card: #FFFFFF;");
  globals = globals.replace(/--bg-card-hover:\s*#FFF4D6;/gi, "--bg-card-hover: #FDFDFD;");
  fs.writeFileSync(globalsPath, globals);
}

console.log("Total files updated: " + changedCount);
