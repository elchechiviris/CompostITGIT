import React from 'react';
import { useParams } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { Database } from '../types/supabase';

const FarmDetails = () => {
  const { farmId } = useParams();
  const supabase = useSupabaseClient<Database>();
  const [farm, setFarm] = React.useState<any>(null);
  const [fields, setFields] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFarmDetails = async () => {
      try {
        // Fetch farm details
        const { data: farmData, error: farmError } = await supabase
          .from('farms')
          .select('*')
          .eq('id', farmId)
          .single();

        if (farmError) throw farmError;
        setFarm(farmData);

        // Fetch associated fields
        const { data: fieldsData, error: fieldsError } = await supabase
          .from('fields')
          .select('*')
          .eq('farm_id', farmId);

        if (fieldsError) throw fieldsError;
        setFields(fieldsData);
      } catch (error) {
        console.error('Error fetching farm details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (farmId) {
      fetchFarmDetails();
    }
  }, [farmId, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Farm not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{farm.name}</h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Location</p>
            <p className="text-gray-900">{farm.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Acres</p>
            <p className="text-gray-900">{farm.acres}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field) => (
            <div key={field.id} className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">{field.name}</h3>
              <p className="text-sm text-gray-600">Acres: {field.acres}</p>
              <p className="text-sm text-gray-600">Soil Type: {field.soil_type}</p>
              <p className="text-sm text-gray-600">Last Crop: {field.last_crop}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmDetails;