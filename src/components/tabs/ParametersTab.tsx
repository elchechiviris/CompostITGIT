import React from 'react';
import FormField from '../common/FormField';
import { FormData } from '../../types/soilAnalysis';
import { 
  plantTypeOptions, 
  dilutionOptions, 
  bacterialDilutionOptions,
  dropsOptions,
  coverslipOptions
} from '../../constants/options';

interface ParametersTabProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ParametersTab: React.FC<ParametersTabProps> = ({ formData, onChange }) => {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Input Parameters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 p-4 bg-blue-50 rounded-md mb-4">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Sample Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Client Name"
              name="client"
              type="text"
              value={formData.client}
              onChange={onChange}
              placeholder="Enter client name"
            />
            <FormField
              label="Organization"
              name="organization"
              type="text"
              value={formData.organization}
              onChange={onChange}
              placeholder="Enter organization"
            />
            <FormField
              label="Date Collected"
              name="dateCollected"
              type="date"
              value={formData.dateCollected}
              onChange={onChange}
            />
            <FormField
              label="Date Observed"
              name="dateObserved"
              type="date"
              value={formData.dateObserved}
              onChange={onChange}
            />
            <FormField
              label="Sample Name"
              name="sample"
              type="text"
              value={formData.sample}
              onChange={onChange}
              placeholder="Enter sample name"
            />
            <FormField
              label="Observer Name"
              name="observer"
              type="text"
              value={formData.observer}
              onChange={onChange}
              placeholder="Enter observer name"
            />
          </div>
        </div>
        
        <div className="md:col-span-2 p-4 bg-green-50 rounded-md">
          <h3 className="text-lg font-medium text-green-800 mb-2">Analysis Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Plant Type"
              name="plantType"
              type="select"
              value={formData.plantType}
              onChange={onChange}
              options={plantTypeOptions}
            />
            <FormField
              label="Dilution Factor"
              name="dilution"
              type="select"
              value={formData.dilution}
              onChange={onChange}
              options={dilutionOptions}
            />
            <FormField
              label="Bacterial Dilution Factor"
              name="bacterialDilution"
              type="select"
              value={formData.bacterialDilution}
              onChange={onChange}
              options={bacterialDilutionOptions}
            />
            <FormField
              label="Drops per ml"
              name="dropsPerMl"
              type="select"
              value={formData.dropsPerMl}
              onChange={onChange}
              options={dropsOptions}
            />
            <FormField
              label="Coverslip Size"
              name="coverslipFields"
              type="select"
              value={formData.coverslipFields}
              onChange={onChange}
              options={coverslipOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParametersTab;