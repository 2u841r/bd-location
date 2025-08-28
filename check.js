import fs from "node:fs";
import path from "node:path";

// Helper to convert sorted numbers into ranges
function toRanges(arr) {
  if (!arr.length)
    return [];
  arr.sort((a, b) => a - b);
  const ranges = [];
  let start = arr[0];
  let end = arr[0];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === end + 1) {
      end = arr[i];
    }
    else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = end = arr[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges;
}

// Helper to find duplicates
function findDuplicates(arr) {
  const seen = new Set();
  const duplicates = new Set();
  arr.forEach((id) => {
    if (seen.has(id))
      duplicates.add(id);
    else seen.add(id);
  });
  return [...duplicates];
}

function checkJsonIds(filePath) {
  const absPath = path.resolve(filePath);
  const data = JSON.parse(fs.readFileSync(absPath, "utf8"));

  const missing = { districts: [], subdistricts: [] };
  const unsorted = { districts: [], subdistricts: [] };
  const duplicates = { districts: [], subdistricts: [] };

  data.forEach((division) => {
    // ---- Districts ----
    const districtIds = division.districts.map(d => d.id).sort((a, b) => a - b);
    const originalDistrictIds = division.districts.map(d => d.id);

    // Missing
    const missingDistricts = [];
    for (let i = districtIds[0]; i <= districtIds[districtIds.length - 1]; i++) {
      if (!districtIds.includes(i))
        missingDistricts.push(i);
    }
    if (missingDistricts.length) {
      missing.districts.push({ division: division.name, ids: toRanges(missingDistricts) });
    }

    // Unsorted
    const unsortedDistricts = originalDistrictIds.filter((id, idx) => id !== districtIds[idx]);
    if (unsortedDistricts.length) {
      unsorted.districts.push({ division: division.name, ids: unsortedDistricts });
    }

    // Duplicates
    const duplicateDistricts = findDuplicates(originalDistrictIds);
    if (duplicateDistricts.length) {
      duplicates.districts.push({ division: division.name, ids: duplicateDistricts });
    }

    // ---- Subdistricts ----
    division.districts.forEach((district) => {
      const subIds = district.subdistricts.map(s => s.id).sort((a, b) => a - b);
      const originalSubIds = district.subdistricts.map(s => s.id);

      // Missing
      const missingSub = [];
      for (let i = subIds[0]; i <= subIds[subIds.length - 1]; i++) {
        if (!subIds.includes(i))
          missingSub.push(i);
      }
      if (missingSub.length) {
        missing.subdistricts.push({
          division: division.name,
          district: district.name,
          ids: toRanges(missingSub),
        });
      }

      // Unsorted
      const unsortedSub = originalSubIds.filter((id, idx) => id !== subIds[idx]);
      if (unsortedSub.length) {
        unsorted.subdistricts.push({
          division: division.name,
          district: district.name,
          ids: unsortedSub,
        });
      }

      // Duplicates
      const duplicateSub = findDuplicates(originalSubIds);
      if (duplicateSub.length) {
        duplicates.subdistricts.push({
          division: division.name,
          district: district.name,
          ids: duplicateSub,
        });
      }
    });
  });
  return { missing: false, unsorted, duplicates };
}

// ✅ Use your JSON path
const result = checkJsonIds("./f.json");
console.log(JSON.stringify(result, null, 2));
