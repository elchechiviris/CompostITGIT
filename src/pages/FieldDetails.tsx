import React from 'react';
import { useParams } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { Database } from '../types/supabase';

const FieldDetails = () => {
  const { farmId, fieldId } = useParams();
  const supabase = useSupabaseClient<Database>();
  const [field, setField] = React.useState<any>(null);
  const [plots, setPlots] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFieldDetails = async () => {
      try {
        // Fetch field details
        const { data: fieldData, error: fieldError } = await supabase
          .from('fields')
          .select('*')
          .eq('id', fieldId)
          .single();

        if (fieldError) throw fieldError;
        setField(fieldData);

        // Fetch associated plots
        const { data: plotsData, error: plotsError } = await supabase
          .from('plots')
          .select('*')
          .eq('field_id', fieldId);

        if (plotsError) throw plotsError;
        setPlots(plotsData);
      } catch (error) {
        console.error('Error fetching field details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (fieldId) {
      fetchFieldDetails();
    }
  }, [fieldId, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Field not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{field.name}</h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Acres</p>
            <p className="text-gray-900">{field.acres}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Soil Type</p>
            <p className="text-gray-900">{field.soil_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Crop</p>
            <p className="text-gray-900">{field.last_crop}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Plots</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plots.map((plot) => (
            <div key={plot.id} className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">{plot.name}</h3>
              <p className="text-sm text-gray-600">Acres: {plot.acres}</p>
              <p className="text-sm text-gray-600">Crop: {plot.crop}</p>
              <p className="text-sm text-gray-600">Status: {plot.status}</p>
              <p className="text-sm text-gray-600">Planted: {new Date(plot.planted_date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FieldDetails;