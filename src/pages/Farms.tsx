import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Farm {
  id: string;
  name: string;
  location: string;
  acres: number;
  client_id: string;
  created_at: string;
  client?: {
    name: string;
    display_id: string;
  };
}

interface Field {
  id: string;
  name: string;
  acres: number;
  soil_type: string;
  last_crop: string;
  created_at: string;
  plots?: Plot[];
  fertilizer_applications?: FertilizerApplication[];
}

interface Plot {
  id: string;
  name: string;
  acres: number;
  crop: string;
  status: string;
  planted_date: string;
}

interface FertilizerApplication {
  id: string;
  type: string;
  amount: number;
  unit: string;
  application_date: string;
  notes?: string;
}

const Farms = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [showFertilizerModal, setShowFertilizerModal] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('details');

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    acres: '',
    client_id: ''
  });

  const [fieldFormData, setFieldFormData] = useState({
    name: '',
    acres: '',
    soil_type: '',
    last_crop: ''
  });

  const [plotFormData, setPlotFormData] = useState({
    name: '',
    acres: '',
    crop: '',
    status: 'active',
    planted_date: new Date().toISOString().split('T')[0]
  });

  const [fertilizerFormData, setFertilizerFormData] = useState({
    type: '',
    amount: '',
    unit: 'kg/ha',
    application_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchFarms();
    fetchClients();
  }, []);

  const fetchFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select(`
          *,
          client:clients (
            name,
            display_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchFields = async (farmId: string) => {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select(`
          *,
          plots (*),
          fertilizer_applications (*)
        `)
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleFieldInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFieldFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlotInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlotFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFertilizerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFertilizerFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.location || !formData.acres || !formData.client_id) {
      setValidationError('All fields are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const farmData = {
        name: formData.name,
        location: formData.location,
        acres: Number(formData.acres),
        client_id: formData.client_id,
        user_id: user.id
      };

      if (selectedFarm) {
        const { error } = await supabase
          .from('farms')
          .update(farmData)
          .eq('id', selectedFarm.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('farms')
          .insert([farmData]);

        if (error) throw error;
      }

      await fetchFarms();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving farm:', error);
      setValidationError('Failed to save farm');
    }
  };

  const handleAddField = async () => {
    if (!selectedFarm) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('fields')
        .insert([{
          ...fieldFormData,
          farm_id: selectedFarm.id,
          user_id: user.id,
          acres: Number(fieldFormData.acres)
        }]);

      if (error) throw error;

      await fetchFields(selectedFarm.id);
      setFieldFormData({
        name: '',
        acres: '',
        soil_type: '',
        last_crop: ''
      });
    } catch (error) {
      console.error('Error adding field:', error);
    }
  };

  const handleAddPlot = async () => {
    if (!selectedField) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('plots')
        .insert([{
          ...plotFormData,
          field_id: selectedField.id,
          user_id: user.id,
          acres: Number(plotFormData.acres)
        }]);

      if (error) throw error;

      await fetchFields(selectedFarm!.id);
      setShowPlotModal(false);
      setPlotFormData({
        name: '',
        acres: '',
        crop: '',
        status: 'active',
        planted_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding plot:', error);
    }
  };

  const handleAddFertilizer = async () => {
    if (!selectedField) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('fertilizer_applications')
        .insert([{
          ...fertilizerFormData,
          field_id: selectedField.id,
          user_id: user.id,
          amount: Number(fertilizerFormData.amount)
        }]);

      if (error) throw error;

      await fetchFields(selectedFarm!.id);
      setShowFertilizerModal(false);
      setFertilizerFormData({
        type: '',
        amount: '',
        unit: 'kg/ha',
        application_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error) {
      console.error('Error adding fertilizer application:', error);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;

      await fetchFields(selectedFarm!.id);
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  };

  const handleDeletePlot = async (plotId: string) => {
    try {
      const { error } = await supabase
        .from('plots')
        .delete()
        .eq('id', plotId);

      if (error) throw error;

      await fetchFields(selectedFarm!.id);
    } catch (error) {
      console.error('Error deleting plot:', error);
    }
  };

  const handleDeleteFertilizer = async (fertilizerId: string) => {
    try {
      const { error } = await supabase
        .from('fertilizer_applications')
        .delete()
        .eq('id', fertilizerId);

      if (error) throw error;

      await fetchFields(selectedFarm!.id);
    } catch (error) {
      console.error('Error deleting fertilizer application:', error);
    }
  };

  const handleEdit = async (farm: Farm) => {
    setSelectedFarm(farm);
    setFormData({
      name: farm.name,
      location: farm.location,
      acres: farm.acres.toString(),
      client_id: farm.client_id
    });
    await fetchFields(farm.id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedFarm) return;

    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', selectedFarm.id);

      if (error) throw error;

      await fetchFarms();
      setShowDeleteConfirmation(false);
      setSelectedFarm(null);
    } catch (error) {
      console.error('Error deleting farm:', error);
      setValidationError('Failed to delete farm');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      acres: '',
      client_id: ''
    });
    setSelectedFarm(null);
    setValidationError('');
    setActiveTab('details');
    setFields([]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Farms</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Add New Farm
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : farms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Location</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Size (acres)</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Date Added</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {farms.map((farm) => (
                  <tr
                    key={farm.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEdit(farm)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{farm.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{farm.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{farm.acres}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {farm.client ? (
                        <div>
                          <div className="font-medium">{farm.client.name}</div>
                          <div className="text-gray-500 text-xs">{farm.client.display_id}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No client assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(farm.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(farm);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFarm(farm);
                            setShowDeleteConfirmation(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No farms added yet.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-bold">
                {selectedFarm ? 'Edit Farm' : 'Add New Farm'}
              </Dialog.Title>
              <Dialog.Close className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </Dialog.Close>
            </div>

            {validationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {validationError}
              </div>
            )}

            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Tabs.List className="flex border-b mb-6">
                <Tabs.Trigger
                  value="details"
                  className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-green-600"
                >
                  Details
                </Tabs.Trigger>
                {selectedFarm && (
                  <Tabs.Trigger
                    value="fields"
                    className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-green-600"
                  >
                    Fields
                  </Tabs.Trigger>
                )}
              </Tabs.List>

              <Tabs.Content value="details">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Enter farm name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <select
                      name="client_id"
                      value={formData.client_id}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name} ({client.display_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Enter location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Size (acres)
                    </label>
                    <input
                      type="number"
                      name="acres"
                      value={formData.acres}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Enter size in acres"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="fields">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Add New Field</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={fieldFormData.name}
                          onChange={handleFieldInputChange}
                          className="w-full border rounded-md px-3 py-2"
                          placeholder="Enter field name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Size (acres)
                        </label>
                        <input
                          type="number"
                          name="acres"
                          value={fieldFormData.acres}
                          onChange={handleFieldInputChange}
                          className="w-full border rounded-md px-3 py-2"
                          placeholder="Enter size in acres"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Soil Type
                        </label>
                        <input
                          type="text"
                          name="soil_type"
                          value={fieldFormData.soil_type}
                          onChange={handleFieldInputChange}
                          className="w-full border rounded-md px-3 py-2"
                          placeholder="Enter soil type"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Crop
                        </label>
                        <input
                          type="text"
                          name="last_crop"
                          value={fieldFormData.last_crop}
                          onChange={handleFieldInputChange}
                          className="w-full border rounded-md px-3 py-2"
                          placeholder="Enter last crop"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddField}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Add Field
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Fields</h3>
                    {fields.length > 0 ? (
                      <div className="space-y-4">
                        {fields.map(field => (
                          <div key={field.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-medium">{field.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {field.acres} acres • {field.soil_type}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Last crop: {field.last_crop}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDeleteField(field.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="text-sm font-medium text-gray-700">Plots</h5>
                                  <button
                                    onClick={() => {
                                      setSelectedField(field);
                                      setShowPlotModal(true);
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    Add Plot
                                  </button>
                                </div>
                                {field.plots && field.plots.length > 0 ? (
                                  <div className="space-y-2">
                                    {field.plots.map(plot => (
                                      <div key={plot.id} className="text-sm bg-gray-50 p-2 rounded flex justify-between items-start">
                                        <div>
                                          <div className="font-medium">{plot.name}</div>
                                          <div className="text-gray-500">
                                            {plot.acres} acres • {plot.crop}
                                          </div>
                                          <div className="text-gray-500">
                                            Planted: {new Date(plot.planted_date).toLocaleDateString()}
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => handleDeletePlot(plot.id)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">No plots added</p>
                                )}
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="text-sm font-medium text-gray-700">
                                    Fertilizer Applications
                                  </h5>
                                  <button
                                    onClick={() => {
                                      setSelectedField(field);
                                      setShowFertilizerModal(true);
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    Add Application
                                  </button>
                                </div>
                                {field.fertilizer_applications && field.fertilizer_applications.length > 0 ? (
                                  <div className="space-y-2">
                                    {field.fertilizer_applications.map(app => (
                                      <div key={app.id} className="text-sm bg-gray-50 p-2 rounded flex justify-between items-start">
                                        <div>
                                          <div className="font-medium">{app.type}</div>
                                          <div className="text-gray-500">
                                            {app.amount} {app.unit}
                                          </div>
                                          <div className="text-gray-500">
                                            Applied: {new Date(app.application_date).toLocaleDateString()}
                                          </div>
                                          {app.notes && (
                                            <div className="text-gray-500 mt-1">
                                              Notes: {app.notes}
                                            </div>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => handleDeleteFertilizer(app.id)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">No applications recorded</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No fields added yet</p>
                    )}
                  </div>
                </div>
              </Tabs.Content>
            </Tabs.Root>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {selectedFarm ? 'Update Farm' : 'Add Farm'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Plot Modal */}
      <Dialog.Root open={showPlotModal} onOpenChange={setShowPlotModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-bold">
                Add New Plot
              </Dialog.Title>
              <Dialog.Close className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plot Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={plotFormData.name}
                  onChange={handlePlotInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter plot name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size (acres)
                </label>
                <input
                  type="number"
                  name="acres"
                  value={plotFormData.acres}
                  onChange={handlePlotInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter size in acres"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crop
                </label>
                <input
                  
                  type="text"
                  name="crop"
                  value={plotFormData.crop}
                  onChange={handlePlotInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter crop name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={plotFormData.status}
                  onChange={handlePlotInputChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="dormant">Dormant</option>
                  <option value="planned">Planned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planting Date
                </label>
                <input
                  type="date"
                  name="planted_date"
                  value={plotFormData.planted_date}
                  onChange={handlePlotInputChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowPlotModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPlot}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Plot
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Fertilizer Modal */}
      <Dialog.Root open={showFertilizerModal} onOpenChange={setShowFertilizerModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-bold">
                Add Fertilizer Application
              </Dialog.Title>
              <Dialog.Close className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fertilizer Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={fertilizerFormData.type}
                  onChange={handleFertilizerInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter fertilizer type"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={fertilizerFormData.amount}
                  onChange={handleFertilizerInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  name="unit"
                  value={fertilizerFormData.unit}
                  onChange={handleFertilizerInputChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="kg/ha">kg/ha</option>
                  <option value="lbs/acre">lbs/acre</option>
                  <option value="tons/ha">tons/ha</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Date
                </label>
                <input
                  type="date"
                  name="application_date"
                  value={fertilizerFormData.application_date}
                  onChange={handleFertilizerInputChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={fertilizerFormData.notes}
                  onChange={handleFertilizerInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Enter any additional notes"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowFertilizerModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFertilizer}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Application
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">
              Confirm Delete
            </Dialog.Title>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this farm? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default Farms;