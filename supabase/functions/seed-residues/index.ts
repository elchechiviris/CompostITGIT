import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleResidues = [
  {
    weight: 1000,
    humidity: 65,
    ph: 6.8,
    volume: 2.5,
    supplier: 'Local Farm A',
    location: 'North Field',
    description: 'Fresh grass clippings',
    cn_ratio: 17
  },
  {
    weight: 800,
    humidity: 15,
    ph: 6.5,
    volume: 4.0,
    supplier: 'Wood Mill B',
    location: 'Storage Unit 1',
    description: 'Sawdust',
    cn_ratio: 325
  },
  {
    weight: 500,
    humidity: 80,
    ph: 6.2,
    volume: 1.2,
    supplier: 'Restaurant C',
    location: 'Kitchen Waste Bin',
    description: 'Food scraps',
    cn_ratio: 12
  },
  {
    weight: 1200,
    humidity: 35,
    ph: 7.0,
    volume: 3.0,
    supplier: 'Garden Center D',
    location: 'Compost Area',
    description: 'Fallen leaves',
    cn_ratio: 60
  },
  {
    weight: 300,
    humidity: 75,
    ph: 6.9,
    volume: 0.8,
    supplier: 'Coffee Shop E',
    location: 'Waste Collection',
    description: 'Coffee grounds',
    cn_ratio: 20
  },
  {
    weight: 900,
    humidity: 45,
    ph: 6.7,
    volume: 2.2,
    supplier: 'Farm F',
    location: 'Barn Storage',
    description: 'Straw',
    cn_ratio: 80
  },
  {
    weight: 400,
    humidity: 85,
    ph: 6.4,
    volume: 1.0,
    supplier: 'Market G',
    location: 'Produce Section',
    description: 'Vegetable waste',
    cn_ratio: 13
  },
  {
    weight: 600,
    humidity: 20,
    ph: 6.6,
    volume: 1.5,
    supplier: 'Paper Mill H',
    location: 'Recycling Area',
    description: 'Cardboard',
    cn_ratio: 350
  },
  {
    weight: 700,
    humidity: 70,
    ph: 7.1,
    volume: 1.8,
    supplier: 'Brewery I',
    location: 'Waste Storage',
    description: 'Spent grain',
    cn_ratio: 15
  },
  {
    weight: 1100,
    humidity: 30,
    ph: 6.8,
    volume: 2.8,
    supplier: 'Landscaper J',
    location: 'Yard Waste',
    description: 'Wood chips',
    cn_ratio: 400
  }
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.split(' ')[1] || ''
    );

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if residues already exist
    const { data: existingResidues } = await supabase
      .from('residues')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (existingResidues && existingResidues.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Sample residues already exist' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Insert sample residues
    const residuesWithUserId = sampleResidues.map(residue => ({
      ...residue,
      user_id: user.id
    }));

    const { error } = await supabase
      .from('residues')
      .insert(residuesWithUserId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: 'Sample residues added successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});