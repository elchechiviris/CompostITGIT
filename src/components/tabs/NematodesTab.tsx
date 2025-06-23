import React from 'react';
import { FieldData } from '../../types/soilAnalysis';

interface NematodesTabProps {
  fieldData: FieldData;
  onChange: (newFieldData: FieldData) => void;
}

const NematodesTab: React.FC<NematodesTabProps> = ({ fieldData, onChange }) => {
  const nematodeCategories = [
    { key: 'nematodesBacterial', label: 'Bacterial-feeding' },
    { key: 'nematodesFungal', label: 'Fungal-feeding' },
    { key: 'nematodesPredator', label: 'Predatory' },
    { key: 'nematodesRoot', label: 'Root-feeding' }
  ];

  const handleChange = (key: keyof FieldData, value: string) => {
    onChange({
      ...fieldData,
      [key]: value
    });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Nematode Scan</h2>
      
      <div className="p-4 border rounded bg-gray-50 transition-all hover:shadow-sm mb-4">
        <div className="group relative">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Nematode Counts</h3>
          <span className="absolute left-0 top-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-64 z-10">
            Number of nematodes observed per type at 400X magnification.
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {nematodeCategories.map(({ key, label }) => (
            <div key={key} className="bg-white p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} Nematodes
              </label>
              <input
                type="number"
                value={fieldData[key as keyof FieldData] as string}
                onChange={(e) => handleChange(key as keyof FieldData, e.target.value)}
                className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder={`Enter ${label.toLowerCase()} count`}
                min="0"
                step="any"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Nematode Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-yellow-700 mb-1">Bacterial-feeding Nematodes</h4>
            <p className="text-sm text-gray-600">
              These nematodes feed on bacteria and help regulate bacterial populations.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-yellow-700 mb-1">Fungal-feeding Nematodes</h4>
            <p className="text-sm text-gray-600">
              These nematodes feed on fungi and help control fungal growth.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-yellow-700 mb-1">Predatory Nematodes</h4>
            <p className="text-sm text-gray-600">
              These nematodes feed on other nematodes and help control pest populations.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-yellow-700 mb-1">Root-feeding Nematodes</h4>
            <p className="text-sm text-gray-600">
              These nematodes feed on plant roots and can be harmful to plants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NematodesTab;