import { Recipe } from './pile';

export interface Movement {
  id: string;
  residueId: string;
  pileId: string;
  amount: number;
  type: 'volume' | 'weight';
  date: string;
  recipe: Recipe[];
}

export interface Residue {
  id: string;
  weight: number;
  humidity: number;
  ph: number;
  volume: number;
  supplier: string;
  location: string;
  description: string | null;
  cn_ratio: number;
  created_at: string;
  updated_at: string;
  movements?: Movement[];
}