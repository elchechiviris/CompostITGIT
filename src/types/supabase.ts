export interface Database {
  public: {
    Tables: {
      farms: {
        Row: {
          id: string;
          name: string;
          acres: number;
          location: string;
          icon: string;
          color: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['farms']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['farms']['Insert']>;
      };
      fields: {
        Row: {
          id: string;
          farm_id: string;
          name: string;
          acres: number;
          soil_type: string;
          last_crop: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fields']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['fields']['Insert']>;
      };
      plots: {
        Row: {
          id: string;
          field_id: string;
          name: string;
          acres: number;
          crop: string;
          status: string;
          planted_date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['plots']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['plots']['Insert']>;
      };
      residues: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['residues']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['residues']['Insert']>;
      };
      piles: {
        Row: {
          id: string;
          name: string;
          weight: number;
          humidity: number;
          ph: number;
          volume: number;
          location: string;
          description: string | null;
          cn_ratio: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['piles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['piles']['Insert']>;
      };
      pile_recipes: {
        Row: {
          id: string;
          pile_id: string;
          residue_id: string;
          proportion: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pile_recipes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['pile_recipes']['Insert']>;
      };
      residue_movements: {
        Row: {
          id: string;
          residue_id: string;
          pile_id: string;
          amount: number;
          type: 'volume' | 'weight';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['residue_movements']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['residue_movements']['Insert']>;
      };
    };
  };
}