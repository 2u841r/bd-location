import fs from "node:fs";
import path from "node:path";

const filePath = path.resolve("./d-d-sd.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

// Start IDs
let corporationId = 801;
let regularId = 1;

// Helper to get next available regular ID
function getNextRegularId(existingIds) {
  while (existingIds.has(regularId)) regularId++;
  existingIds.add(regularId);
  return regularId++;
}

// Helper to get next available corporation ID
function getNextCorporationId(existingIds) {
  while (existingIds.has(corporationId)) corporationId++;
  existingIds.add(corporationId);
  return corporationId++;
}

// Fix Corporation IDs first, then others, and fix conflicts
data.forEach((division) => {
  division.districts.forEach((district) => {
    const existingIds = new Set(); // Track IDs in this district

    district.subdistricts.forEach((sub) => {
      if (sub.name.includes("Corporation")) {
        sub.id = getNextCorporationId(existingIds);
      }
      else {
        sub.id = getNextRegularId(existingIds);
      }
    });

    // Resolve any conflicts within district
    const seen = new Set();
    district.subdistricts.forEach((sub) => {
      while (seen.has(sub.id)) {
        sub.id += 1; // Increment until no conflict
      }
      seen.add(sub.id);
    });
  });
});

// Save fixed JSON
const outPath = path.resolve("./f.json");
fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");

console.log("Duplicates and conflicts fixed! Saved as d-d-sd-fixed.json");
