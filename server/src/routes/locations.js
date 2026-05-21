const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

let locationsData = null;

try {
    const dataPath = path.join(__dirname, '..', 'data', 'locations.json');
    locationsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (error) {
    console.error("Could not load locations.json, please generate it first.");
}

router.get('/hierarchy', (req, res) => {
    if (!locationsData) {
        return res.status(500).json({ message: "Location data not available" });
    }
    res.json(locationsData);
});

module.exports = router;
