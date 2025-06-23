import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { Pile } from '../types/pile';
import RecipeSelector from '../components/RecipeSelector';
import { supabase } from '../lib/supabase';

const Piles = () => {
  const [piles, setPiles] = useState<Pile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedPile, setSelectedPile] = useState<Pile | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('details');
  const [tempPileId, setTempPileId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    humidity: '',
    ph: '',
    volume: '',
    location: '',
    description: '',
    cnRatio: '',
    physicalQuality: {
      temperature: '',
      humidity: '',
      ph: '',
      density: '',
      porosity: '',
      particleSize: ''
    },
    microbiologicalQuality: {
      totalBacteria: '',
      fungi: '',
      actinomycetes: '',
      thermophiles: '',
      pathogens: ''
    }
  });

  useEffect(() => {
    fetchPiles();
  }, []);

  const fetchPiles = async () => {
    try {
      const { data, error } = await supabase
        .from('piles')
        .select(`
          *,
          pile_recipes (
            residue_id,
            proportion,
            residue:residues (
              supplier,
              cn_ratio
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPiles(data || []);
    } catch (error) {
      console.error('Error fetching piles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    set

FormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleQualityInputChange = (category: 'physicalQuality' | 'microbiologicalQuality', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const ph = Number(formData.ph);
    const humidity = Number(formData.humidity);

    if (ph < 1 || ph > 14) {
      setValidationError('pH must be between 1 and 14');
      return false;
    }

    if (humidity < 0 || humidity > 100) {
      setValidationError('Humidity must be between 0% and 100%');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const pileData = {
        name: formData.name,
        weight: Number(formData.weight) || 0,
        humidity: Number(formData.humidity) || 0,
        ph: Number(formData.ph) || 7,
        volume: Number(formData.volume) || 0,
        location: formData.location,
        description: formData.description,
        cn_ratio: Number(formData.cnRatio) || 0,
        user_id: user.id
      };

      if (selectedPile) {
        const { error } = await supabase
          .from('piles')
          .update({
            ...pileData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedPile.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('piles')
          .insert([{
            ...pileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();

        if (error) throw error;
        if (data && data[0]) {
          setTempPileId(data[0].id);
        }
      }

      await fetchPiles();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving pile:', error);
      setValidationError('Failed to save pile');
    }
  };

  const handleEdit = (pile: Pile) => {
    setSelectedPile(pile);
    setTempPileId(pile.id);
    setFormData({
      name: pile.name || '',
      weight: pile.weight?.toString() || '',
      humidity: pile.humidity?.toString() || '',
      ph: pile.ph?.toString() || '',
      volume: pile.volume?.toString() || '',
      location: pile.location || '',
      description: pile.description || '',
      cnRatio: pile.cn_ratio?.toString() || '',
      physicalQuality: pile.physicalQuality ? {
        temperature: pile.physicalQuality.temperature?.toString() || '',
        humidity: pile.physicalQuality.humidity?.toString() || '',
        ph: pile.physicalQuality.ph?.toString() || '',
        density: pile.physicalQuality.density?.toString() || '',
        porosity: pile.physicalQuality.porosity?.toString() || '',
        particleSize: pile.physicalQuality.particleSize?.toString() || ''
      } : {
        temperature: '',
        humidity: '',
        ph: '',
        density: '',
        porosity: '',
        particleSize: ''
      },
      microbiologicalQuality: pile.microbiologicalQuality ? {
        totalBacteria: pile.microbiologicalQuality.totalBacteria?.toString() || '',
        fungi: pile.microbiologicalQuality.fungi?.toString() || '',
        actinomycetes: pile.microbiologicalQuality.actinomycetes?.toString() || '',
        thermophiles: pile.microbiologicalQuality.thermophiles?.toString() || '',
        pathogens: pile.microbiologicalQuality.pathogens?.toString() || ''
      } : {
        totalBacteria: '',
        fungi: '',
        actinomycetes: '',
        thermophiles: '',
        pathogens: ''
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPile) return;

    try {
      const { error } = await supabase
        .from('piles')
        .delete()
        .eq('id', selectedPile.id);

      if (error) throw error;

      await fetchPiles();
      setShowDeleteConfirmation(false);
      setSelectedPile(null);
    } catch (error) {
      console.error('Error deleting pile:', error);
      setValidationError('Failed to delete pile');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      weight: '',
      humidity: '',
      ph: '',
      volume: '',
      location: '',
      description: '',
      cnRatio: '',
      physicalQuality: {
        temperature: '',
        humidity: '',
        ph: '',
        density: '',
        porosity: '',
        particleSize: ''
      },
      microbiologicalQuality: {
        totalBacteria: '',
        fungi: '',
        actinomycetes: '',
        thermophiles: '',
        pathogens: ''
      }
    });
    setSelectedPile(null);
    setTempPileId(null);
    setValidationError('');
    setActiveTab('details');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compost Piles</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Build New Pile
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : piles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Location</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Weight (kg)</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Volume (m³)</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">C:N Ratio</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Date Created</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {piles.map((pile) => (
                  <tr
                    key={pile.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEdit(pile)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{pile.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{pile.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{pile.weight}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{pile.volume}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{pile.cn_ratio}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(pile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(pile);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPile(pile);
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
            <p className="text-gray-500">No compost piles created yet.</p>
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
                {selectedPile ? 'Edit Pile' : 'Build New Pile'}
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
                {selectedPile && (
                  <>
                    <Tabs.Trigger
                      value="recipe"
                      className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-green-600"
                    >
                      Recipe
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="physical"
                      className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-green-600"
                    >
                      Physical Quality
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="microbiological"
                      className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-green-600"
                    >
                      Microbiological Quality
                    </Tabs.Trigger>
                  </>
                )}
              </Tabs.List>

              <Tabs.Content value="details">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>

                  <div className="col-span-2">
                    <button
                      onClick={() => setIsRecipeModalOpen(true)}
                      className="w-full bg-green-50 text-green-700 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Select Recipe
                    </button>
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Humidity (%)
                    </label>
                    <input
                      type="number"
                      name="humidity"
                      value={formData.humidity}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      pH
                    </label>
                    <input
                      type="number"
                      name="ph"
                      value={formData.ph}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                      min="1"
                      max="14"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volume (m³)
                    </label>
                    <input
                      type="number"
                      name="volume"
                      value={formData.volume}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="0.01"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      C:N Ratio
                    </label>
                    <input
                      type="number"
                      name="cnRatio"
                      value={formData.cnRatio}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="0.1"
                      readOnly
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                      rows={3}
                    />
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="recipe">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Pile Recipe</h3>
                    <button
                      onClick={() => setIsRecipeModalOpen(true)}
                      className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-full hover:bg-green-100"
                    >
                      Edit Recipe
                    </button>
                  </div>

                  {selectedPile?.pile_recipes && selectedPile.pile_recipes.length > 0 ? (
                    <div className="bg-white rounded-lg border">
                      <div className="px-4 py-3 border-b bg-gray-50">
                        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500">
                          <div>Material</div>
                          <div>Proportion</div>
                          <div>C:N Ratio</div>
                        </div>
                      </div>
                      <div className="divide-y">
                        {selectedPile.pile_recipes.map((recipe) => (
                          <div key={recipe.residue_id} className="px-4 py-3">
                            <div className="grid grid-cols-3 gap-4">
                              <div>{recipe.residue?.supplier}</div>
                              <div>{(recipe.proportion * 100).toFixed(1)}%</div>
                              <div>{recipe.residue?.cn_ratio}:1</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 border-t bg-gray-50">
                        <div className="grid grid-cols-3 gap-4 font-medium">
                          <div>Total</div>
                          <div>
                            {(selectedPile.pile_recipes.reduce((sum, r) => sum + r.proportion, 0) * 100).toFixed(1)}%
                          </div>
                          <div>
                            {(selectedPile.pile_recipes.reduce((sum, r) => sum + (r.proportion * (r.residue?.cn_ratio || 0)), 0)).toFixed(1)}:1
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                      <p className="text-gray-500">No recipe defined yet.</p>
                      <button
                        onClick={() => setIsRecipeModalOpen(true)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Add Recipe
                      </button>
                    </div>
                  )}
                </div>
              </Tabs.Content>

              <Tabs.Content value="physical">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      value={formData.physicalQuality.temperature}
                      onChange={(e) => handleQualityInputChange('physicalQuality', 'temperature', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Humidity (%)
                    </label>
                    <input
                      type="number"
                      value={formData.physicalQuality.humidity}
                      onChange={(e) => handleQualityInputChange('physicalQuality', 'humidity', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      pH
                    </label>
                    <input
                      type="number"
                      value={formData.physicalQuality.ph}
                      onChange={(e) => handleQualityInputChange('physicalQuality', 'ph', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      min="1"
                      max="14"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Density (kg/m³)
                    </label>
                    <input
                      type="number"
                      value={formData.physicalQuality.density}
                      onChange={(e) => handleQualityInputChange('physicalQuality', 'density', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Porosity (%)
                    </label>
                    <input
                      type="number"
                      value={formData.physicalQuality.porosity}
                      onChange={(e) => handleQualityInputChange('physicalQuality', 'porosity', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Particle Size (mm)
                    </label>
                    <input
                      type="number"
                      value={formData.physicalQuality.particleSize}
                      onChange={(e) => handleQualityInputChange('physicalQuality', 'particleSize', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="microbiological">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Bacteria (CFU/g)
                    </label>
                    <input
                      type="number"
                      value={formData.microbiologicalQuality.totalBacteria}
                      onChange={(e) => handleQualityInputChange('microbiologicalQuality', 'totalBacteria', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fungi (CFU/g)
                    </label>
                    <input
                      type="number"
                      value={formData.microbiologicalQuality.fungi}
                      onChange={(e) => handleQualityInputChange('microbiologicalQuality', 'fungi', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actinomycetes (CFU/g)
                    </label>
                    <input
                      type="number"
                      value={formData.microbiologicalQuality.actinomycetes}
                      onChange={(e) => handleQualityInputChange('microbiologicalQuality', 'actinomycetes', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thermophiles (CFU/g)
                    </label>
                    <input
                      type="number"
                      value={formData.microbiologicalQuality.thermophiles}
                      onChange={(e) => handleQualityInputChange('microbiologicalQuality', 'thermophiles', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pathogens (CFU/g)
                    </label>
                    <input
                      type="number"
                      value={formData.microbiologicalQuality.pathogens}
                      onChange={(e) => handleQualityInputChange('microbiologicalQuality', 'pathogens', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="1"
                    />
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
                {selectedPile ? 'Update Pile' : 'Create Pile'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <RecipeSelector
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        pileId={selectedPile?.id || tempPileId || ''}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">
              Confirm Delete
            </Dialog.Title>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this pile? This action cannot be undone.
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

export default Piles;