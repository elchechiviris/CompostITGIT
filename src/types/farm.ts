export interface FertilizerApplication {
  id: string;
  type: string;
  amount: number;
  unit: string;
  applicationDate: string;
  notes?: string;
}

export interface Plot {
  id: string;
  name: string;
  size: number;
  crop: string;
  status: 'active' | 'dormant' | 'planned';
  plantingDate?: string;
  harvestDate?: string;
  fertilization: FertilizerApplication[];
}

export interface Field {
  id: string;
  name: string;
  size: number;
  location: string;
  soilType: string;
  lastCrop?: string;
  irrigationType?: string;
  plots: Plot[];
  fertilization: FertilizerApplication[];
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  totalSize: number;
  owner: string;
  description?: string;
  fields: Field[];
  createdAt: string;
  updatedAt: string;
}