const fs = require('fs');

const statesList = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const mockData = statesList.map(state => {
  return {
    state: state,
    lgas: [
      {
        lga: `${state} LGA 1`,
        wards: [
          {
            ward: `Ward A`,
            polling_units: [
              { name: "Town Hall PU", code: "PU-001" },
              { name: "Primary School PU", code: "PU-002" }
            ]
          },
          {
            ward: `Ward B`,
            polling_units: [
              { name: "Market Square PU", code: "PU-003" }
            ]
          }
        ]
      },
      {
        lga: `${state} LGA 2`,
        wards: [
          {
            ward: `Ward C`,
            polling_units: [
              { name: "Health Center PU", code: "PU-004" }
            ]
          }
        ]
      }
    ]
  };
});

fs.writeFileSync('./prisma/inec_data.json', JSON.stringify(mockData, null, 2));
console.log("Created mock inec_data.json with all 36 states!");
