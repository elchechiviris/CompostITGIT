import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Residue } from '../types/residue';
import { AppConfig } from '../types/config';
import { supabase } from '../lib/supabase';

const Residues = () => {
  const [residues, setResidues] = useState<Residue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResidue, setSelectedResidue] = useState<Residue | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [nextId, setNextId] = useState(1);
  const [showMovements, setShowMovements] = useState(false);
  const [movements, setMovements] = useState<any[]>([]);

  const [config] = useState<AppConfig>(() => {
    const savedConfig = localStorage.getItem('appConfig');
    return savedConfig ? JSON.parse(savedConfig) : {
      residues: {
        cnRatioThresholds: {
          highNitrogen: 15,
          green: 30
        }
      }
    };
  });

  const [formData, setFormData] = useState({
    weight: '',
    humidity: '',
    ph: '',
    volume: '',
    supplier: '',
    location: '',
    description: '',
    cnRatio: ''
  });

  useEffect(() => {
    fetchResidues();
  }, []);

  const fetchResidues = async () => {
    try {
      const { data: residuesData, error: residuesError } = await supabase
        .from('residues')
        .select('*')
        .order('created_at', { ascending: false });

      if (residuesError) throw residuesError;

      // Fetch movements for each residue
      const residuesWithMovements = await Promise.all((residuesData || []).map(async (residue) => {
        const { data: movementsData } = await supabase
          .from('residue_movements')
          .select(`
            *,
            pile:piles (
              name,
              pile_recipes (
                proportion,
                residue:residues (
                  supplier
                )
              )
            )
          `)
          .eq('residue_id', residue.id)
          .order('created_at', { ascending: true });

        // Calculate remaining volume based on initial volume and movements
        const remainingVolume = Math.min(
          residue.volume,
          (movementsData || []).reduce((total, movement) => total + movement.amount, residue.volume)
        );

        return {
          ...residue,
          movements: movementsData || [],
          remainingVolume
        };
      }));

      setResidues(residuesWithMovements);
    } catch (error) {
      console.error('Error fetching residues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovements = async (residueId: string) => {
    try {
      const { data, error } = await supabase
        .from('residue_movements')
        .select(`
          *,
          pile:piles (
            name,
            pile_recipes (
              proportion,
              residue:residues (
                supplier
              )
            )
          )
        `)
        .eq('residue_id', residueId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const validateForm = () => {
    const ph = Number(formData.ph);
    const humidity = Number(formData.humidity);
    const cnRatio = Number(formData.cnRatio);

    if (ph < 1 || ph > 14) {
      setValidationError('pH must be between 1 and 14');
      return false;
    }

    if (humidity < 0 || humidity > 100) {
      setValidationError('Humidity must be between 0% and 100%');
      return false;
    }

    if (cnRatio <= 0) {
      setValidationError('C:N ratio must be greater than 0');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const residueData = {
        weight: Number(formData.weight),
        humidity: Number(formData.humidity),
        ph: Number(formData.ph),
        volume: Number(formData.volume),
        supplier: formData.supplier,
        location: formData.location,
        description: formData.description || null,
        cn_ratio: Number(formData.cnRatio),
        user_id: user.id
      };

      if (selectedResidue) {
        // Calculate volume difference
        const volumeDifference = Number(formData.volume) - selectedResidue.volume;

        const { error: updateError } = await supabase
          .from('residues')
          .update({
            ...residueData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedResidue.id);

        if (updateError) throw updateError;

        // Create a movement record if volume changed
        if (volumeDifference !== 0) {
          const { error: movementError } = await supabase
            .from('residue_movements')
            .insert([{
              residue_id: selectedResidue.id,
              amount: volumeDifference,
              type: 'volume',
              user_id: user.id
            }]);

          if (movementError) throw movementError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('residues')
          .insert([{
            ...residueData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }

      await fetchResidues();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving residue:', error);
      setValidationError('Failed to save residue');
    }
  };

  const handleEdit = (residue: Residue) => {
    if (!residue) return;
    
    setSelectedResidue(residue);
    setFormData({
      weight: residue.weight?.toString() || '',
      humidity: residue.humidity?.toString() || '',
      ph: residue.ph?.toString() || '',
      volume: residue.volume?.toString() || '',
      supplier: residue.supplier || '',
      location: residue.location || '',
      description: residue.description || '',
      cnRatio: residue.cn_ratio?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedResidue) return;

    try {
      const { error } = await supabase
        .from('residues')
        .delete()
        .eq('id', selectedResidue.id);

      if (error) throw error;

      await fetchResidues();
      setShowDeleteConfirmation(false);
      setSelectedResidue(null);
    } catch (error) {
      console.error('Error deleting residue:', error);
      setValidationError('Failed to delete residue');
    }
  };

  const resetForm = () => {
    setFormData({
      weight: '',
      humidity: '',
      ph: '',
      volume: '',
      supplier: '',
      location: '',
      description: '',
      cnRatio: ''
    });
    setSelectedResidue(null);
    setValidationError('');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Residue Management</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Add New Batch
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : residues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 border-b">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Supplier</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Location</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Weight (kg)</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Initial Volume (m³)</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Remaining Volume (m³)</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">C:N Ratio</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Date Added</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {residues.map((residue) => (
                  <tr
                    key={residue.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEdit(residue)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{residue.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{residue.supplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{residue.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{residue.weight}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{residue.volume}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{residue.remainingVolume.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{residue.cn_ratio}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(residue.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResidue(residue);
                            fetchMovements(residue.id);
                            setShowMovements(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          History
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(residue);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResidue(residue);
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
            <p className="text-gray-500">No residue batches added yet.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-bold">
                {selectedResidue ? 'Edit Batch' : 'Add New Batch'}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch ID
                </label>
                <input
                  type="text"
                  value={selectedResidue?.id || `RES-${nextId.toString().padStart(4, '0')}`}
                  className="w-full border rounded-md px-3 py-2 bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                />
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
                {selectedResidue ? 'Update Batch' : 'Add Batch'}
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
              Are you sure you want to delete this batch? This action cannot be undone.
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

      {/* Movements History Modal */}
      <Dialog.Root open={showMovements} onOpenChange={setShowMovements}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-bold">
                Movement History - {selectedResidue?.supplier}
              </Dialog.Title>
              <Dialog.Close className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </Dialog.Close>
            </div>

            {movements.length > 0 ? (
              <div className="space-y-4">
                {movements.map((movement, index) => {
                  // Calculate running total up to this movement
                  const runningTotal = Math.min(
                    selectedResidue?.volume || 0,
                    movements
                      .slice(0, index + 1)
                      .reduce((sum, m) => sum + m.amount, selectedResidue?.volume || 0)
                  );

                  return (
                    <div key={movement.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {movement.pile ? `Pile: ${movement.pile.name}` : 'Volume Adjustment'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(movement.created_at).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Running Total: {runningTotal.toFixed(2)} m³
                          </p>
                        </div>
                        <span className={`text-lg font-medium ${movement.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {movement.amount > 0 ? '+' : ''}{movement.amount.toFixed(2)} m³
                        </span>
                      </div>
                      {movement.pile?.pile_recipes && (
                        <div className="bg-gray-50 p-3 rounded-md mt-2">
                          <h5 className="text-sm font-medium mb-2">Recipe Composition</h5>
                          <div className="space-y-1">
                            {movement.pile.pile_recipes.map((recipe: any) => (
                              <div key={recipe.residue_id} className="flex justify-between text-sm">
                                <span>{recipe.residue.supplier}</span>
                                <span>{(recipe.proportion * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No movements recorded for this batch.</p>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default Residues;