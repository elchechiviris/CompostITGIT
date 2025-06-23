export interface Client {
  id: string;
  display_id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  responsible: string;
  vat_number: string;
  type: 'supplier' | 'customer';
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  client_id: string;
  type: 'farm' | 'residue' | 'pile' | 'microbiology';
  description: string;
  created_at: string;
  reference_id: string;
}