const fs = require('fs');

function processLocations(jsonContent, csvContent) {
    // Parse JSON
    const rawData = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;

    // Parse CSV (simple parser since no quotes or complex structures expected, but use split with care)
    const csvLines = csvContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // First line is header: Name,Area_Type,District_City
    const citiesMap = new Map();

    for (let i = 1; i < csvLines.length; i++) {
        const parts = csvLines[i].split(',');
        if (parts.length >= 3) {
            // Recompose Name if it contained commas
            const district = parts[parts.length - 1].trim();
            const areaType = parts[parts.length - 2].trim();
            const name = parts.slice(0, parts.length - 2).join(',').trim();

            if (!citiesMap.has(district)) {
                citiesMap.set(district, []);
            }
            citiesMap.get(district).push({ name, areaType });
        }
    }

    // Build unified hierarchy
    const hierarchy = rawData.provinces.map(province => {
        return {
            name: province.name,
            districts: province.districts.map(district => {
                const districtName = district.name;
                // Find cities/towns for this district from CSV mapping
                // We might need loose string matching if capitalization differs
                let cities = [];
                const districtKey = Array.from(citiesMap.keys()).find(k => k.toLowerCase() === districtName.toLowerCase());
                if (districtKey) {
                    cities = citiesMap.get(districtKey).map(c => c.name);
                }

                return {
                    name: districtName,
                    tehsils: district.tehsils,
                    cities: cities
                };
            })
        };
    });

    return { provinces: hierarchy };
}

module.exports = { processLocations };
