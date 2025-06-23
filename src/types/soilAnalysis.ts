export type Tab = 'parameters' | 'nematodes' | 'assessment' | 'bacteria';

export interface FormData {
  client: string;
  organization: string;
  dateCollected: string;
  dateObserved: string;
  sample: string;
  observer: string;
  plantType: string;
  dilution: number;
  bacterialDilution: number;
  dropsPerMl: number;
  coverslipFields: number;
}

export interface DetailedMeasurement {
  length: string;
  diameter?: string;
}

export interface FieldOfView {
  actinobacteria: DetailedMeasurement[];
  fungi: DetailedMeasurement[];
  oomycetes: DetailedMeasurement[];
  flagellate: string;
  amoebae: string;
  ciliates: string;
}

export interface Reading {
  id: string;
  name: string;
  fieldsOfView: FieldOfView[];
}

export interface FieldData {
  readings: Reading[];
  bacterial: string[];
  nematodesBacterial: string;
  nematodesFungal: string;
  nematodesPredator: string;
  nematodesRoot: string;
}

export interface Results {
  bacteria: {
    perGram: number;
    micrograms: number;
    standardDeviation: number;
  };
  actinobacteria: {
    length: number;
    micrograms: number;
    standardDeviation: number;
  };
  fungi: {
    length: number;
    micrograms: number;
    standardDeviation: number;
  };
  oomycetes: {
    length: number;
    micrograms: number;
    standardDeviation: number;
  };
  flagellate: number;
  flagellateStdDev: number;
  amoebae: number;
  amoebaeStdDev: number;
  ciliates: number;
  ciliatesStdDev: number;
  nematodes: number;
  nematodesBacterial: number;
  nematodesFungal: number;
  nematodesPredator: number;
  nematodesRoot: number;
  fbRatio: number;
  fbRatioStdDev: number;
}

export interface PlantThresholds {
  protozoa: number;
  bacteria: number;
  fbRatio: [number, number];
}