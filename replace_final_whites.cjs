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

// All the hex codes we consider "white" or "off-white background"
const whiteHexes = [
  "ffffff", "fff", "fdfdfd", "f9fafb", "f8f7f4", 
  "fafaf9", "f5f7fa", "f3f4f6", "f1f5f9", "f8fafc", 
  "fafafa", "f5f5f5", "e2e8f0", "e5e7eb"
];

// RGB representations
const whiteRgbas = [
  { r: 255, g: 255, b: 255 }, // white
  { r: 243, g: 244, b: 246 }, // gray-100
  { r: 248, g: 250, b: 252 }, // slate-50
  { r: 241, g: 245, b: 249 }, // slate-100
  { r: 249, g: 250, b: 251 }, // gray-50
  { r: 226, g: 232, b: 240 }, // slate-200
  { r: 229, g: 231, b: 235 }, // gray-200
];

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  const originalContent = content;

  // 1. Replace all bg-[hex]
  whiteHexes.forEach(hex => {
    // bg-[#ffffff]
    const bgHexRegex = new RegExp(`bg-\\[#${hex}\\]`, "gi");
    content = content.replace(bgHexRegex, "bg-[#FFF4D6]");
  });

  // 2. Replace all style backgrounds (including ternaries)
  // We'll do this by matching the style attribute and replacing inside it
  content = content.replace(/style=\{([^}]+)\}/g, (match, p1) => {
    let inner = p1;
    // Replace hex codes in style block if they are mapped to background or just any hex if it matches
    // Since we only want to change backgrounds, we'll look for background related keys
    // But it's hard to parse JS in regex. 
    // Let's just replace all occurrences of our white hexes in the style block.
    // This might change text color if it was purely white, but the user wants perfect sync. 
    // Wait, let's be safer: replace only if preceded by background, backgroundColor, or in ternaries for backgrounds.
    // Actually, in Topbar it's: background: searchFocused ? '#ffffff' : 'rgba(...)'
    
    whiteHexes.forEach(hex => {
      const hexRegex = new RegExp(`'#${hex}'|"#${hex}"`, "gi");
      inner = inner.replace(hexRegex, "'#FFF4D6'");
    });

    whiteRgbas.forEach(rgba => {
      const rgbaRegex = new RegExp(`rgba\\(\\s*${rgba.r}\\s*,\\s*${rgba.g}\\s*,\\s*${rgba.b}\\s*,\\s*([0-9.]+)\\s*\\)`, "gi");
      inner = inner.replace(rgbaRegex, "rgba(255, 244, 214, $1)");
    });

    return `style={${inner}}`;
  });

  // 3. Replace any straggling bg-white (just in case)
  content = content.replace(/\bbg-white\b/g, "bg-[#FFF4D6]");
  
  // 4. CSS files
  if (file.endsWith('.css')) {
    whiteHexes.forEach(hex => {
      const cssRegex = new RegExp(`#${hex}\\b`, "gi");
      content = content.replace(cssRegex, "#FFF4D6");
    });
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log("Updated: " + file);
    changedCount++;
  }
});

console.log("Total files updated: " + changedCount);
