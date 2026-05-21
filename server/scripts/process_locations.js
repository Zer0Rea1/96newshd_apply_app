const fs = require('fs');
const path = require('path');
const { processLocations } = require('../src/utils/locationProcessor');

const jsonPath = path.join(__dirname, '..', 'pakistan.json');
const csvPath = path.join(__dirname, '..', 'pakistan.csv');
const outPath = path.join(__dirname, '..', 'src', 'data', 'locations.json');

try {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    const unifiedData = processLocations(jsonContent, csvContent);

    // Ensure the output directory exists
    const outDir = path.dirname(outPath);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(outPath, JSON.stringify(unifiedData, null, 2));
    console.log('Successfully generated locations.json at', outPath);
} catch (error) {
    console.error('Error processing locations:', error);
    process.exit(1);
}
