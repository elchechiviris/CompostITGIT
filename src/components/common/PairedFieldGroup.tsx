import React from 'react';
import { FieldData } from '../../types/soilAnalysis';

interface PairedFieldGroupProps {
  lengthCategory: keyof FieldData;
  diameterCategory: keyof FieldData;
  label: string;
  fieldData: FieldData;
  visibleFields: number;
  onChange: (category: keyof FieldData, index: number, value: string) => void;
  tooltipText?: string;
}

const PairedFieldGroup: React.FC<PairedFieldGroupProps> = ({
  lengthCategory,
  diameterCategory,
  label,
  fieldData,
  visibleFields,
  onChange,
  tooltipText,
}) => {
  return (
    <div className="mb-4 p-4 border rounded bg-gray-50 transition-all hover:shadow-sm">
      <div className="group relative">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{label}</h3>
        {tooltipText && (
          <span className="absolute left-0 top-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-64 z-10">
            {tooltipText}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.isArray(fieldData[lengthCategory]) && 
          (fieldData[lengthCategory] as string[]).slice(0, visibleFields).map((_, index) => (
            <div key={index} className="flex space-x-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Length</label>
                <input
                  type="number"
                  value={(fieldData[lengthCategory] as string[])[index]}
                  onChange={(e) => onChange(lengthCategory, index, e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Length"
                  min="0"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Diameter</label>
                <input
                  type="number"
                  value={(fieldData[diameterCategory] as string[])[index]}
                  onChange={(e) => onChange(diameterCategory, index, e.target.value)}
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Diameter"
                  min="0"
                  step="any"
                />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default PairedFieldGroup;