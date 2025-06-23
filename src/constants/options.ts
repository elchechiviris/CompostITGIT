export const plantTypeOptions = [
  { 
    label: "Vegetables", 
    value: "vegetables", 
    thresholds: { 
      protozoa: 10000, 
      bacteria: 135, 
      fbRatio: [0.5, 1] 
    } 
  },
  { 
    label: "Forests", 
    value: "forests", 
    thresholds: { 
      protozoa: 5000, 
      bacteria: 200, 
      fbRatio: [1, 2] 
    } 
  },
  { 
    label: "Grasslands", 
    value: "grasslands", 
    thresholds: { 
      protozoa: 7500, 
      bacteria: 150, 
      fbRatio: [0.3, 0.7] 
    } 
  },
];

export const coverslipOptions = [
  { label: "18x18 mm (2038 fields)", value: 2038 },
  { label: "22x18 mm (2491 fields)", value: 2491 },
  { label: "22x22 mm (3044 fields)", value: 3044 },
];

export const dropsOptions = [
  { label: "1 drop (20 drops/ml)", value: 20 },
  { label: "2 drops (10 drops/ml)", value: 10 },
];

export const dilutionOptions = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
];

export const bacterialDilutionOptions = [
  { label: "100", value: 100 },
  { label: "500", value: 500 },
  { label: "1000", value: 1000 },
];