import React from 'react';
import { FieldData } from '../../types/soilAnalysis';

interface FieldGroupProps {
  category: keyof FieldData;
  label: string;
  fieldData: FieldData;
  visibleFields: number;
  onChange: (category: keyof FieldData, index: number, value: string) => void;
  addMoreFields?: () => void;
  isMainCategory?: boolean;
  tooltipText?: string;
}

const FieldGroup: React.FC<FieldGroupProps> = ({
  category,
  label,
  fieldData,
  visibleFields,
  onChange,
  addMoreFields,
  isMainCategory = false,
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
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
        {Array.isArray(fieldData[category]) && 
          (fieldData[category] as string[]).slice(0, visibleFields).map((value, index) => (
            <input
              key={index}
              type="number"
              value={value}
              onChange={(e) => onChange(category, index, e.target.value)}
              className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder={`Field ${index + 1}`}
              min="0"
              step="any"
            />
          ))
        }
      </div>
      
      {isMainCategory && addMoreFields && (
        <button
          onClick={addMoreFields}
          className="mt-3 bg-green-600 text-white rounded p-2 w-full hover:bg-green-700 transition disabled:opacity-50"
          disabled={visibleFields >= 20}
        >
          Add More Fields
        </button>
      )}
    </div>
  );
};

export default FieldGroup;