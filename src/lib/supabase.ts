import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper functions for data operations
export const fetchResidues = async () => {
  const { data, error } = await supabase
    .from('residues')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchPiles = async () => {
  const { data, error } = await supabase
    .from('piles')
    .select(`
      *,
      pile_recipes (
        residue_id,
        proportion
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createPile = async (pile: Omit<Database['public']['Tables']['piles']['Insert'], 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('piles')
    .insert([pile])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePile = async (id: string, pile: Database['public']['Tables']['piles']['Update']) => {
  const { data, error } = await supabase
    .from('piles')
    .update(pile)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePile = async (id: string) => {
  const { error } = await supabase
    .from('piles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const createResidue = async (residue: Omit<Database['public']['Tables']['residues']['Insert'], 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('residues')
    .insert([residue])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateResidue = async (id: string, residue: Database['public']['Tables']['residues']['Update']) => {
  const { data, error } = await supabase
    .from('residues')
    .update(residue)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteResidue = async (id: string) => {
  const { error } = await supabase
    .from('residues')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const createPileRecipe = async (recipe: Omit<Database['public']['Tables']['pile_recipes']['Insert'], 'created_at'>) => {
  const { data, error } = await supabase
    .from('pile_recipes')
    .insert([recipe])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createResidueMovement = async (movement: Omit<Database['public']['Tables']['residue_movements']['Insert'], 'created_at'>) => {
  const { data, error } = await supabase
    .from('residue_movements')
    .insert([movement])
    .select()
    .single();

  if (error) throw error;
  return data;
};