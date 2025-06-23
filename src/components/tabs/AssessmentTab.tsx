import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X } from 'lucide-react';
import { FieldData, Reading, FieldOfView, DetailedMeasurement } from '../../types/soilAnalysis';

interface AssessmentTabProps {
  fieldData: FieldData;
  onChange: (newFieldData: FieldData) => void;
}

const AssessmentTab: React.FC<AssessmentTabProps> = ({ fieldData, onChange }) => {
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [selectedFieldOfView, setSelectedFieldOfView] = useState<number | null>(null);
  const [selectedMeasurementType, setSelectedMeasurementType] = useState<string | null>(null);

  const createEmptyFieldOfView = (): FieldOfView => ({
    actinobacteria: [],
    fungi: [],
    oomycetes: [],
    flagellate: "",
    amoebae: "",
    ciliates: "",
  });

  const addReading = () => {
    if (!fieldData?.readings || fieldData.readings.length >= 5) return;
    
    const newReading: Reading = {
      id: `reading-${fieldData.readings.length + 1}`,
      name: `Reading ${fieldData.readings.length + 1}`,
      fieldsOfView: [createEmptyFieldOfView()]
    };

    onChange({
      ...fieldData,
      readings: [...fieldData.readings, newReading]
    });
  };

  const addFieldOfView = (readingId: string) => {
    if (!fieldData?.readings) return;
    
    const reading = fieldData.readings.find(r => r.id === readingId);
    if (!reading || reading.fieldsOfView.length >= 10) return;

    const newFieldData = {
      ...fieldData,
      readings: fieldData.readings.map(r => {
        if (r.id === readingId) {
          return {
            ...r,
            fieldsOfView: [...r.fieldsOfView, createEmptyFieldOfView()]
          };
        }
        return r;
      })
    };

    onChange(newFieldData);
  };

  const addDetailedMeasurement = (
    readingId: string,
    fieldOfViewIndex: number,
    type: keyof FieldOfView
  ) => {
    if (!['actinobacteria', 'fungi', 'oomycetes'].includes(type)) return;

    const newFieldData = {
      ...fieldData,
      readings: fieldData.readings.map(r => {
        if (r.id === readingId) {
          const newFieldsOfView = [...r.fieldsOfView];
          const measurements = (newFieldsOfView[fieldOfViewIndex][type] || []) as DetailedMeasurement[];
          
          if (measurements.length < 10) {
            measurements.push({ length: "", diameter: "" });
          }
          
          return { ...r, fieldsOfView: newFieldsOfView };
        }
        return r;
      })
    };

    onChange(newFieldData);
  };

  const updateMeasurement = (
    readingId: string,
    fieldOfViewIndex: number,
    type: keyof FieldOfView,
    measurementIndex: number,
    field: 'length' | 'diameter',
    value: string
  ) => {
    const newFieldData = {
      ...fieldData,
      readings: fieldData.readings.map(r => {
        if (r.id === readingId) {
          const newFieldsOfView = [...r.fieldsOfView];
          const measurements = [...((newFieldsOfView[fieldOfViewIndex][type] || []) as DetailedMeasurement[])];
          measurements[measurementIndex] = {
            ...measurements[measurementIndex],
            [field]: value
          };
          newFieldsOfView[fieldOfViewIndex] = {
            ...newFieldsOfView[fieldOfViewIndex],
            [type]: measurements
          };
          return { ...r, fieldsOfView: newFieldsOfView };
        }
        return r;
      })
    };

    onChange(newFieldData);
  };

  const updateProtozoa = (
    readingId: string,
    fieldOfViewIndex: number,
    type: 'flagellate' | 'amoebae' | 'ciliates',
    value: string
  ) => {
    const newFieldData = {
      ...fieldData,
      readings: fieldData.readings.map(r => {
        if (r.id === readingId) {
          const newFieldsOfView = [...r.fieldsOfView];
          newFieldsOfView[fieldOfViewIndex] = {
            ...newFieldsOfView[fieldOfViewIndex],
            [type]: value
          };
          return { ...r, fieldsOfView: newFieldsOfView };
        }
        return r;
      })
    };

    onChange(newFieldData);
  };

  if (!fieldData?.readings) {
    return null;
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Main Assessment</h2>
        <button
          onClick={addReading}
          disabled={fieldData.readings.length >= 5}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Plus size={16} /> Add Reading
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fieldData.readings.map((reading) => (
          <div key={reading.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{reading.name}</h3>
              <button
                onClick={() => addFieldOfView(reading.id)}
                disabled={reading.fieldsOfView.length >= 10}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {reading.fieldsOfView.map((fov, fovIndex) => (
                <Dialog.Root key={fovIndex}>
                  <Dialog.Trigger className="w-full p-2 text-left border rounded hover:bg-gray-50 transition-colors">
                    Field of View {fovIndex + 1}
                  </Dialog.Trigger>

                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-xl font-semibold">
                          Field of View {fovIndex + 1}
                        </Dialog.Title>
                        <Dialog.Close className="text-gray-500 hover:text-gray-700">
                          <X size={20} />
                        </Dialog.Close>
                      </div>

                      <div className="space-y-6">
                        {/* Actinobacteria */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Actinobacteria</h4>
                            <button
                              onClick={() => addDetailedMeasurement(reading.id, fovIndex, 'actinobacteria')}
                              className="text-blue-600 hover:text-blue-800"
                              disabled={(fov.actinobacteria || []).length >= 10}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          {(fov.actinobacteria || []).map((measurement, mIndex) => (
                            <div key={mIndex} className="flex gap-2 mb-2">
                              <input
                                type="number"
                                value={measurement.length}
                                onChange={(e) => updateMeasurement(
                                  reading.id,
                                  fovIndex,
                                  'actinobacteria',
                                  mIndex,
                                  'length',
                                  e.target.value
                                )}
                                className="border rounded p-2 w-full"
                                placeholder="Length"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Fungi */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Fungi</h4>
                            <button
                              onClick={() => addDetailedMeasurement(reading.id, fovIndex, 'fungi')}
                              className="text-blue-600 hover:text-blue-800"
                              disabled={(fov.fungi || []).length >= 10}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          {(fov.fungi || []).map((measurement, mIndex) => (
                            <div key={mIndex} className="flex gap-2 mb-2">
                              <input
                                type="number"
                                value={measurement.length}
                                onChange={(e) => updateMeasurement(
                                  reading.id,
                                  fovIndex,
                                  'fungi',
                                  mIndex,
                                  'length',
                                  e.target.value
                                )}
                                className="border rounded p-2 w-1/2"
                                placeholder="Length"
                              />
                              <input
                                type="number"
                                value={measurement.diameter}
                                onChange={(e) => updateMeasurement(
                                  reading.id,
                                  fovIndex,
                                  'fungi',
                                  mIndex,
                                  'diameter',
                                  e.target.value
                                )}
                                className="border rounded p-2 w-1/2"
                                placeholder="Diameter"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Oomycetes */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Oomycetes</h4>
                            <button
                              onClick={() => addDetailedMeasurement(reading.id, fovIndex, 'oomycetes')}
                              className="text-blue-600 hover:text-blue-800"
                              disabled={(fov.oomycetes || []).length >= 10}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          {(fov.oomycetes || []).map((measurement, mIndex) => (
                            <div key={mIndex} className="flex gap-2 mb-2">
                              <input
                                type="number"
                                value={measurement.length}
                                onChange={(e) => updateMeasurement(
                                  reading.id,
                                  fovIndex,
                                  'oomycetes',
                                  mIndex,
                                  'length',
                                  e.target.value
                                )}
                                className="border rounded p-2 w-1/2"
                                placeholder="Length"
                              />
                              <input
                                type="number"
                                value={measurement.diameter}
                                onChange={(e) => updateMeasurement(
                                  reading.id,
                                  fovIndex,
                                  'oomycetes',
                                  mIndex,
                                  'diameter',
                                  e.target.value
                                )}
                                className="border rounded p-2 w-1/2"
                                placeholder="Diameter"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Protozoa */}
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Protozoa</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Flagellate</label>
                              <input
                                type="number"
                                value={fov.flagellate}
                                onChange={(e) => updateProtozoa(
                                  reading.id,
                                  fovIndex,
                                  'flagellate',
                                  e.target.value
                                )}
                                className="border rounded p-2 w-full"
                                placeholder="Count"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Amoebae</label>
                              <input
                                type="number"
                                value={fov.amoebae}
                                onChange={(e) => updateProtozoa(
                                  reading.id,
                                  fovIndex,
                                  'amoebae',
                                  e.target.value
                                )}
                                className="border rounded p-2 w-full"
                                placeholder="Count"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Ciliates</label>
                              <input
                                type="number"
                                value={fov.ciliates}
                                onChange={(e) => updateProtozoa(
                                  reading.id,
                                  fovIndex,
                                  'ciliates',
                                  e.target.value
                                )}
                                className="border rounded p-2 w-full"
                                placeholder="Count"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentTab;