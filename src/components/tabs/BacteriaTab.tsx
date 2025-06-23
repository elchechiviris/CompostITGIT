import React from 'react';
import FieldGroup from '../common/FieldGroup';
import { FieldData } from '../../types/soilAnalysis';

interface BacteriaTabProps {
  fieldData: FieldData;
  onChange: (newFieldData: FieldData) => void;
}

const BacteriaTab: React.FC<BacteriaTabProps> = ({ fieldData, onChange }) => {
  const visibleFields = fieldData.bacterial.length;
  
  const handleFieldChange = (category: keyof FieldData, index: number, value: string) => {
    const newBacterial = [...fieldData.bacterial];
    newBacterial[index] = value;
    onChange({
      ...fieldData,
      bacterial: newBacterial
    });
  };

  const handleAddMoreFields = () => {
    if (visibleFields >= 20) return;
    
    const newBacterial = [...fieldData.bacterial];
    newBacterial.push("");
    onChange({
      ...fieldData,
      bacterial: newBacterial
    });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Bacteria Count</h2>
      <p className="text-gray-600 mb-4">
        Currently showing data for {visibleFields} microscope fields.
      </p>
      
      <FieldGroup
        category="bacterial"
        label="Bacterial Count"
        fieldData={fieldData}
        visibleFields={visibleFields}
        onChange={handleFieldChange}
        addMoreFields={handleAddMoreFields}
        isMainCategory={true}
        tooltipText="Number of bacteria observed at 400X magnification."
      />
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-6">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Bacteria Information</h3>
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            Bacterial counts are a critical measure of soil health. Optimal bacterial levels vary by plant type:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><span className="font-medium">Vegetables</span>: 135+ µg/g</li>
            <li><span className="font-medium">Forests</span>: 200+ µg/g</li>
            <li><span className="font-medium">Grasslands</span>: 150+ µg/g</li>
          </ul>
          <p className="mt-2">
            To get accurate results, count all bacteria visible in each microscope field at 400X magnification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BacteriaTab;