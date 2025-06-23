import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Slider from '@radix-ui/react-slider';
import { X, AlertCircle, Lock, Unlock } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Residue } from '../types/residue';
import { Recipe } from '../types/pile';
import { supabase } from '../lib/supabase';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RecipeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  pileId: string;
}

interface MaterialWithProportion extends Residue {
  volumeProportion: number;
  mixProportion: number;
  isLocked: boolean;
  isLimitant: boolean;
  volumeToMixRatio: number;
  remainingVolume?: number;
}

const getCategory = (cn_ratio: number) => {
  if (cn_ratio <= 15) return 'High Nitrogen';
  if (cn_ratio <= 30) return 'Green';
  return 'Brown';
};

const RecipeSelector: React.FC<RecipeSelectorProps> = ({
  isOpen,
  onClose,
  pileId
}) => {
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialWithProportion[]>([]);
  const [availableResidues, setAvailableResidues] = useState<Residue[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [currentCNRatio, setCurrentCNRatio] = useState(0);
  const [error, setError] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchResidues();
      if (pileId) {
        fetchExistingRecipe();
      }
      setError('');
    }
  }, [isOpen, pileId]);

  const fetchResidues = async () => {
    try {
      const { data, error } = await supabase
        .from('residues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate remaining volume for each residue
      const residuesWithRemainingVolume = await Promise.all((data || []).map(async (residue) => {
        const { data: movementsData } = await supabase
          .from('residue_movements')
          .select('amount')
          .eq('residue_id', residue.id)
          .order('created_at', { ascending: true });

        // Calculate remaining volume: initial volume + sum of all movements (negative for usage)
        const totalMovements = (movementsData || []).reduce((sum, movement) => sum + movement.amount, 0);
        const remainingVolume = Math.max(0, residue.volume + totalMovements);

        return {
          ...residue,
          remainingVolume
        };
      }));

      setAvailableResidues(residuesWithRemainingVolume);
    } catch (error) {
      console.error('Error fetching residues:', error);
      setError('Failed to load available residues');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from('pile_recipes')
        .select(`
          residue_id,
          proportion,
          residue:residues (*)
        `)
        .eq('pile_id', pileId);

      if (error) throw error;

      if (data && data.length > 0) {
        const materials = await Promise.all(data.map(async (recipe) => {
          const residue = recipe.residue as Residue;
          
          // Get remaining volume for this residue
          const { data: movementsData } = await supabase
            .from('residue_movements')
            .select('amount')
            .eq('residue_id', residue.id)
            .order('created_at', { ascending: true });

          const totalMovements = (movementsData || []).reduce((sum, movement) => sum + movement.amount, 0);
          const remainingVolume = Math.max(0, residue.volume + totalMovements);

          return {
            ...residue,
            volumeProportion: recipe.proportion,
            mixProportion: recipe.proportion,
            isLocked: false,
            isLimitant: false,
            volumeToMixRatio: 1,
            remainingVolume
          };
        }));

        materials[0].isLimitant = true;
        setSelectedMaterials(materials);
        updateMixStats(materials);
      }
    } catch (error) {
      console.error('Error fetching existing recipe:', error);
    }
  };

  const groupedResidues = availableResidues.reduce((acc, residue) => {
    const category = getCategory(residue.cn_ratio);
    if (!acc[category]) acc[category] = [];
    acc[category].push(residue);
    return acc;
  }, {} as Record<string, Residue[]>);

  const pieChartData = {
    labels: ['High Nitrogen', 'Green', 'Brown'],
    datasets: [{
      data: [
        selectedMaterials.filter(m => getCategory(m.cn_ratio) === 'High Nitrogen')
          .reduce((sum, m) => sum + m.mixProportion, 0) * 100,
        selectedMaterials.filter(m => getCategory(m.cn_ratio) === 'Green')
          .reduce((sum, m) => sum + m.mixProportion, 0) * 100,
        selectedMaterials.filter(m => getCategory(m.cn_ratio) === 'Brown')
          .reduce((sum, m) => sum + m.mixProportion, 0) * 100
      ],
      backgroundColor: ['#86efac', '#22c55e', '#92400e']
    }]
  };

  const handleMaterialSelect = async (residue: Residue) => {
    if (!selectedMaterials.find(m => m.id === residue.id)) {
      // Get remaining volume for this residue
      const { data: movementsData } = await supabase
        .from('residue_movements')
        .select('amount')
        .eq('residue_id', residue.id)
        .order('created_at', { ascending: true });

      const totalMovements = (movementsData || []).reduce((sum, movement) => sum + movement.amount, 0);
      const remainingVolume = Math.max(0, residue.volume + totalMovements);

      const isFirstMaterial = selectedMaterials.length === 0;
      const newMaterial = {
        ...residue,
        volumeProportion: isFirstMaterial ? 1 : 0,
        mixProportion: isFirstMaterial ? 1 : 0,
        isLocked: !isFirstMaterial,
        isLimitant: isFirstMaterial,
        volumeToMixRatio: 1,
        remainingVolume
      };

      setSelectedMaterials(prev => {
        const updated = [...prev];
        
        if (updated.length === 1) {
          const firstMaterial = updated[0];
          firstMaterial.isLocked = true;
          firstMaterial.volumeToMixRatio = firstMaterial.volumeProportion / firstMaterial.mixProportion;
        }
        
        updated.push(newMaterial);
        const redistributed = redistributeProportions(updated, 'both');
        updateMixStats(redistributed);
        return redistributed;
      });
    }
  };

  const handleRemoveMaterial = (id: string) => {
    setSelectedMaterials(prev => {
      const updated = prev.filter(m => m.id !== id);
      if (updated.length === 1) {
        const material = updated[0];
        const newMaterials = [{
          ...material,
          mixProportion: 1,
          volumeProportion: material.volumeProportion,
          isLocked: false,
          isLimitant: true,
          volumeToMixRatio: material.volumeProportion
        }];
        updateMixStats(newMaterials);
        return newMaterials;
      }
      
      if (prev.find(m => m.id === id)?.isLimitant && updated.length > 0) {
        updated[0].isLimitant = true;
      }
      
      const redistributed = redistributeProportions(updated, 'both');
      updateMixStats(redistributed);
      return redistributed;
    });
  };

  const handleVolumeProportionChange = (id: string, newVolumeProportion: number) => {
    const material = selectedMaterials.find(m => m.id === id);
    if (!material) return;

    // Check if the requested volume exceeds available volume
    const requestedVolume = newVolumeProportion * material.volume;
    const availableVolume = material.remainingVolume || material.volume;
    
    if (requestedVolume > availableVolume) {
      setError(`Cannot exceed available volume. Available: ${availableVolume.toFixed(2)} m³`);
      return;
    }

    if (newVolumeProportion > 1) {
      setError('Cannot exceed 100% of total volume');
      return;
    }

    if (selectedMaterials.length === 1 && !material.isLocked) {
      setSelectedMaterials(materials => {
        const updated = materials.map(m =>
          m.id === id
            ? {
                ...m,
                volumeProportion: newVolumeProportion,
                volumeToMixRatio: newVolumeProportion / m.mixProportion
              }
            : m
        );
        updateMixStats(updated);
        return updated;
      });
      return;
    }

    const newMixProportion = newVolumeProportion / material.volumeToMixRatio;
    handleMixProportionChange(id, newMixProportion);
  };

  const handleMixProportionChange = (id: string, newMixProportion: number) => {
    const material = selectedMaterials.find(m => m.id === id);
    if (!material) return;

    if (selectedMaterials.length === 1 && !material.isLocked) {
      setSelectedMaterials(materials => {
        const updated = materials.map(m =>
          m.id === id
            ? {
                ...m,
                mixProportion: newMixProportion,
                volumeToMixRatio: m.volumeProportion / newMixProportion
              }
            : m
        );
        updateMixStats(updated);
        return updated;
      });
      return;
    }

    if (material.isLimitant) {
      if (newMixProportion < 0 || newMixProportion > 1) {
        setError('Mix proportion must be between 0% and 100%');
        return;
      }

      let updatedMaterials = selectedMaterials.map(m =>
        m.id === id
          ? {
              ...m,
              mixProportion: newMixProportion,
              volumeProportion: newMixProportion * m.volumeToMixRatio
            }
          : m
      );

      updatedMaterials = redistributeProportions(updatedMaterials, 'both');
      updateMixStats(updatedMaterials);
      setSelectedMaterials(updatedMaterials);
      return;
    }

    const limitantMaterial = selectedMaterials.find(m => m.isLimitant);
    if (!limitantMaterial) return;

    const remainingProportion = 1 - limitantMaterial.mixProportion;

    if (selectedMaterials.length === 2) {
      setSelectedMaterials(materials => {
        const updated = materials.map(m => {
          if (m.isLimitant) return m;
          return {
            ...m,
            mixProportion: remainingProportion,
            volumeProportion: remainingProportion * m.volumeToMixRatio
          };
        });
        updateMixStats(updated);
        return updated;
      });
      return;
    }

    if (newMixProportion > remainingProportion) {
      setError('Cannot exceed available proportion');
      return;
    }

    let updatedMaterials = selectedMaterials.map(m =>
      m.id === id
        ? {
            ...m,
            mixProportion: newMixProportion,
            volumeProportion: newMixProportion * m.volumeToMixRatio
          }
        : m
    );

    updatedMaterials = redistributeProportions(updatedMaterials, 'both');
    updateMixStats(updatedMaterials);
    setSelectedMaterials(updatedMaterials);
  };

  const redistributeProportions = (
    materials: MaterialWithProportion[],
    mode: 'mix' | 'volume' | 'both'
  ): MaterialWithProportion[] => {
    if (materials.length <= 1) {
      return materials.map(m => ({
        ...m,
        mixProportion: 1,
        volumeProportion: m.volumeProportion,
        isLocked: false,
        isLimitant: true,
        volumeToMixRatio: m.volumeProportion
      }));
    }

    const limitantMaterial = materials.find(m => m.isLimitant);
    if (!limitantMaterial) return materials;

    const remainingProportion = 1 - limitantMaterial.mixProportion;
    const nonLimitantMaterials = materials.filter(m => !m.isLimitant);

    if (materials.length === 2) {
      return materials.map(m => {
        if (m.isLimitant) return m;
        return {
          ...m,
          mixProportion: remainingProportion,
          volumeProportion: remainingProportion * m.volumeToMixRatio,
          isLocked: true
        };
      });
    }

    const totalNonLimitant = nonLimitantMaterials.reduce((sum, m) => sum + m.mixProportion, 0) || 1;

    return materials.map(m => {
      if (m.isLimitant) return m;

      const newMixProportion = totalNonLimitant === 0
        ? remainingProportion / nonLimitantMaterials.length
        : (m.mixProportion / totalNonLimitant) * remainingProportion;

      return {
        ...m,
        mixProportion: newMixProportion,
        volumeProportion: newMixProportion * m.volumeToMixRatio,
        isLocked: true
      };
    });
  };

  const handleLimitantToggle = (id: string) => {
    if (selectedMaterials.length <= 1) return;

    setSelectedMaterials(prev => {
      const updatedMaterials = prev.map(material =>
        material.id === id
          ? { ...material, isLimitant: true }
          : { ...material, isLimitant: false }
      );
      const redistributed = redistributeProportions(updatedMaterials, 'both');
      updateMixStats(redistributed);
      return redistributed;
    });
  };

  const updateMixStats = (materials: MaterialWithProportion[]) => {
    const totalVol = materials.reduce(
      (sum, mat) => sum + (mat.volume * mat.volumeProportion), 0
    );
    
    const totalCarbon = materials.reduce(
      (sum, mat) => sum + (mat.mixProportion * mat.cn_ratio), 0
    );

    setTotalVolume(totalVol);
    setCurrentCNRatio(totalCarbon);
  };

  const handleConfirmSave = async () => {
    try {
      if (!pileId) {
        setError('Invalid pile ID. Please ensure a pile is selected.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First, delete any existing recipes for this pile
      const { error: deleteError } = await supabase
        .from('pile_recipes')
        .delete()
        .eq('pile_id', pileId);

      if (deleteError) throw deleteError;

      // Then insert the new recipes
      const { error: insertError } = await supabase
        .from('pile_recipes')
        .insert(
          selectedMaterials.map(material => ({
            pile_id: pileId,
            residue_id: material.id,
            proportion: material.mixProportion,
            user_id: user.id
          }))
        );

      if (insertError) throw insertError;

      // Handle residue movements - DEDUCT volumes from residues
      const movementPromises = selectedMaterials.map(async (material) => {
        const volumeUsed = material.volumeProportion * material.volume;
        
        // Insert negative movement to deduct volume
        const { error: movementError } = await supabase
          .from('residue_movements')
          .insert({
            residue_id: material.id,
            pile_id: pileId,
            amount: -volumeUsed, // Negative amount to deduct
            type: 'volume',
            user_id: user.id
          });

        if (movementError) throw movementError;
      });

      await Promise.all(movementPromises);

      // Update pile with new CN ratio and volume
      const { error: updateError } = await supabase
        .from('piles')
        .update({
          cn_ratio: currentCNRatio,
          volume: totalVolume,
          updated_at: new Date().toISOString()
        })
        .eq('id', pileId);

      if (updateError) throw updateError;
      
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error('Error saving recipe:', error);
      setError('Failed to save recipe. Please try again.');
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold">
              Recipe Builder
            </Dialog.Title>
            <Dialog.Close className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </Dialog.Close>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-4">Available Materials</h3>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedResidues).map(([category, materials]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">{category}</h4>
                      <div className="space-y-2">
                        {materials.map(material => {
                          const remainingVolume = material.remainingVolume || material.volume;
                          const isAvailable = remainingVolume > 0;
                          
                          return (
                            <button
                              key={material.id}
                              onClick={() => handleMaterialSelect(material)}
                              disabled={selectedMaterials.some(m => m.id === material.id) || !isAvailable}
                              className={`w-full text-left p-4 rounded-lg border hover:bg-gray-50 disabled:opacity-50 ${
                                !isAvailable ? 'bg-red-50 border-red-200' : ''
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{material.supplier}</span>
                                <span className="text-sm text-gray-500">
                                  C:N {material.cn_ratio}:1
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Total: {material.volume} m³
                              </div>
                              <div className={`text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                Available: {remainingVolume.toFixed(2)} m³
                              </div>
                              {!isAvailable && (
                                <div className="text-xs text-red-500 mt-1">
                                  No volume remaining
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-4">Composition</h3>
              <div className="space-y-4">
                {selectedMaterials.map(material => {
                  const volumeUsed = material.volumeProportion * material.volume;
                  const availableVolume = material.remainingVolume || material.volume;
                  const isVolumeExceeded = volumeUsed > availableVolume;
                  
                  return (
                    <div key={material.id} className={`border rounded-lg p-4 relative ${
                      isVolumeExceeded ? 'border-red-300 bg-red-50' : ''
                    }`}>
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <button
                          onClick={() => handleLimitantToggle(material.id)}
                          className={`text-sm px-2 py-1 rounded ${
                            material.isLimitant
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                          disabled={selectedMaterials.length === 1}
                        >
                          {material.isLimitant ? 'Limitant' : 'Set as Limitant'}
                        </button>
                        <div className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800 flex items-center gap-1">
                          {material.isLocked ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveMaterial(material.id)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 bg-gray-100 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="pr-8 mb-4">
                        <span className="font-medium">{material.supplier}</span>
                        <div className="text-sm text-gray-500">
                          Available: {availableVolume.toFixed(2)} m³
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className={`text-sm mb-1 block ${
                            isVolumeExceeded ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            Volume Used: {volumeUsed.toFixed(2)} m³
                            ({(material.volumeProportion * 100).toFixed(1)}% of total)
                            {isVolumeExceeded && (
                              <span className="text-red-600 font-medium"> - Exceeds available!</span>
                            )}
                          </label>
                          <Slider.Root
                            className="relative flex items-center select-none touch-none w-full h-5"
                            value={[material.volumeProportion * 100]}
                            onValueChange={([value]) => handleVolumeProportionChange(material.id, value / 100)}
                            max={100}
                            step={1}
                            disabled={selectedMaterials.length === 2 && !material.isLimitant}
                          >
                            <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                              <Slider.Range className={`absolute rounded-full h-full ${
                                isVolumeExceeded ? 'bg-red-600' : 'bg-blue-600'
                              }`} />
                            </Slider.Track>
                            <Slider.Thumb
                              className="block w-5 h-5 bg-white shadow-lg rounded-full hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                            />
                          </Slider.Root>
                        </div>

                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">
                            Mix Proportion: {(material.mixProportion * 100).toFixed(1)}%
                          </label>
                          <Slider.Root
                            className="relative flex items-center select-none touch-none w-full h-5"
                            value={[material.mixProportion * 100]}
                            onValueChange={([value]) => handleMixProportionChange(material.id, value / 100)}
                            max={100}
                            step={1}
                            disabled={selectedMaterials.length === 2 && !material.isLimitant}
                          >
                            <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                              <Slider.Range className="absolute bg-green-600 rounded-full h-full" />
                            </Slider.Track>
                            <Slider.Thumb
                              className="block w-5 h-5 bg-white shadow-lg rounded-full hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                            />
                          </Slider.Root>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Mix Analysis</h3>
              <div className="space-y-6">
                {selectedMaterials.length > 0 && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Mix Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Volume:</span>
                          <span>{totalVolume.toFixed(2)} m³</span>
                        </div>
                        <div className="flex justify-between">
                          <span>C:N Ratio:</span>
                          <span className={`font-medium ${
                            currentCNRatio >= 25 && currentCNRatio <= 50
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          }`}>
                            {currentCNRatio.toFixed(1)}:1
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium mb-4">Category Distribution</h4>
                      <div className="w-full h-64">
                        <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                      </div>
                    </div>

                    {currentCNRatio > 0 && (currentCNRatio < 25 || currentCNRatio > 50) && (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">Recommendations</h4>
                        <p className="text-sm text-yellow-700">
                          {currentCNRatio < 25
                            ? 'The mix is too rich in nitrogen. Consider adding more brown materials to increase the C:N ratio.'
                            : 'The mix has too much carbon. Add more nitrogen-rich materials to lower the C:N ratio.'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={selectedMaterials.length === 0 || selectedMaterials.some(m => {
                const volumeUsed = m.volumeProportion * m.volume;
                const availableVolume = m.remainingVolume || m.volume;
                return volumeUsed > availableVolume;
              })}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Save Recipe
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <Dialog.Root open={showConfirmation} onOpenChange={setShowConfirmation}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">
              Confirm Recipe
            </Dialog.Title>
            <p className="text-gray-600 mb-6">
              Are you sure you want to save this recipe? The selected volumes will be deducted from their respective residue batches.
            </p>
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Recipe Summary</h4>
                <div className="space-y-2 text-sm">
                  {selectedMaterials.map(material => {
                    const volumeUsed = material.volumeProportion * material.volume;
                    return (
                      <div key={material.id} className="flex justify-between">
                        <span>{material.supplier}</span>
                        <span>{volumeUsed.toFixed(2)} m³</span>
                      </div>
                    );
                  })}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total Volume:</span>
                      <span>{totalVolume.toFixed(2)} m³</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>C:N Ratio:</span>
                      <span>{currentCNRatio.toFixed(1)}:1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Dialog.Root>
  );
};

export default RecipeSelector;