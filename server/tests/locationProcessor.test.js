const { processLocations } = require('../src/utils/locationProcessor');

describe('processLocations', () => {
    it('should correctly merge JSON tehsils and CSV cities by district', () => {
        const jsonMock = {
            provinces: [
                {
                    name: "Punjab",
                    districts: [
                        {
                            name: "Lahore",
                            tehsils: ["Lahore City", "Lahore Cantonment"]
                        },
                        {
                            name: "Faisalabad",
                            tehsils: ["Faisalabad City", "Jaranwala"]
                        }
                    ]
                }
            ]
        };

        const csvMock = `Name,Area_Type,District_City
Aaliwala,Town,Dera Ghazi Khan
Lahore Central,City,Lahore
Model Town,Town,Lahore
Samundri,City,Faisalabad`;

        const result = processLocations(jsonMock, csvMock);

        expect(result.provinces).toHaveLength(1);
        expect(result.provinces[0].name).toBe('Punjab');

        const lahore = result.provinces[0].districts.find(d => d.name === 'Lahore');
        expect(lahore).toBeDefined();
        expect(lahore.tehsils).toEqual(["Lahore City", "Lahore Cantonment"]);
        expect(lahore.cities).toEqual(["Lahore Central", "Model Town"]);

        const faisalabad = result.provinces[0].districts.find(d => d.name === 'Faisalabad');
        expect(faisalabad.cities).toEqual(["Samundri"]);
    });

    it('should handle case insensitivity in district names', () => {
        const jsonMock = {
            provinces: [
                {
                    name: "Punjab",
                    districts: [
                        {
                            name: "dera ghazi khan",
                            tehsils: []
                        }
                    ]
                }
            ]
        };
        const csvMock = `Name,Area_Type,District_City\nAaliwala,Town,Dera Ghazi Khan`;

        const result = processLocations(jsonMock, csvMock);
        expect(result.provinces[0].districts[0].cities).toEqual(["Aaliwala"]);
    });
});
