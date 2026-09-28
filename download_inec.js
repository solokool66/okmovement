const https = require('https');
const fs = require('fs');

const url = "https://raw.githubusercontent.com/Emeka-Onwuepe/Polling_Units_in_Nigeria/main/Nigeria_polling_units.csv";
const outputFile = "./prisma/inec_data.json";

console.log("Downloading INEC Polling Unit Dataset...");

https.get(url, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download, status code: ${response.statusCode}`);
    return;
  }

  let data = '';
  
  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    console.log(`Download complete! Parsing ${data.length} bytes of CSV...`);
    
    // Parse CSV
    const lines = data.split('\n');
    const statesMap = new Map();

    // Skip header (line 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV split (assuming no commas in the data fields based on the head sample)
      // If there are commas in location, a regex split is needed:
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (cols.length < 10) continue;

      let stateName = cols[1].replace(/^"|"$/g, '').trim();
      // Capitalize first letter of each word for aesthetics
      stateName = stateName.replace(/\b\w/g, c => c.toUpperCase());
      
      let lgaName = cols[2].replace(/^"|"$/g, '').trim();
      lgaName = lgaName.replace(/\b\w/g, c => c.toUpperCase());
      
      let wardName = cols[3].replace(/^"|"$/g, '').trim();
      wardName = wardName.replace(/\b\w/g, c => c.toUpperCase());
      
      const puCode = cols[8].replace(/^"|"$/g, '').trim();
      const puName = cols[9].replace(/^"|"$/g, '').trim();

      // State
      if (!statesMap.has(stateName)) {
        statesMap.set(stateName, { state: stateName, lgasMap: new Map() });
      }
      const stateObj = statesMap.get(stateName);

      // LGA
      if (!stateObj.lgasMap.has(lgaName)) {
        stateObj.lgasMap.set(lgaName, { lga: lgaName, wardsMap: new Map() });
      }
      const lgaObj = stateObj.lgasMap.get(lgaName);

      // Ward
      if (!lgaObj.wardsMap.has(wardName)) {
        lgaObj.wardsMap.set(wardName, { ward: wardName, polling_units: [] });
      }
      const wardObj = lgaObj.wardsMap.get(wardName);

      // PU
      wardObj.polling_units.push({
        name: puName,
        code: puCode
      });
    }

    console.log("CSV Parsed successfully. Building JSON hierarchy...");

    // Convert Maps to Arrays
    const finalData = Array.from(statesMap.values()).map(stateObj => ({
      state: stateObj.state,
      lgas: Array.from(stateObj.lgasMap.values()).map(lgaObj => ({
        lga: lgaObj.lga,
        wards: Array.from(lgaObj.wardsMap.values()).map(wardObj => ({
          ward: wardObj.ward,
          polling_units: wardObj.polling_units
        }))
      }))
    }));

    // Sort alphabetically for the UI
    finalData.sort((a, b) => a.state.localeCompare(b.state));
    finalData.forEach(s => {
      s.lgas.sort((a, b) => a.lga.localeCompare(b.lga));
      s.lgas.forEach(l => {
        l.wards.sort((a, b) => a.ward.localeCompare(b.ward));
      });
    });

    console.log("Writing to inec_data.json...");
    fs.writeFileSync(outputFile, JSON.stringify(finalData));
    console.log(`Successfully generated inec_data.json with ${finalData.length} states!`);
  });

}).on('error', (err) => {
  console.error("Download Error:", err.message);
});
