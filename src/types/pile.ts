export interface PhysicalQuality {
  temperature: number;
  humidity: number;
  ph: number;
  density: number;
  porosity: number;
  particleSize: number;
}

export interface MicrobiologicalQuality {
  totalBacteria: number;
  fungi: number;
  actinomycetes: number;
  thermophiles: number;
  pathogens: number;
}

export interface Recipe {
  residueId: string;
  proportion: number;
}

export interface Pile {
  id: string;
  name: string;
  weight: number;
  humidity: number;
  ph: number;
  volume: number;
  location: string;
  description: string;
  cnRatio: number;
  createdAt: string;
  updatedAt: string;
  recipe: Recipe[];
  physicalQuality?: PhysicalQuality;
  microbiologicalQuality?: MicrobiologicalQuality;
}