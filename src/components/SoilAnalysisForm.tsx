import React, { useState, useEffect } from 'react';
import { Save, Upload, RotateCcw, Calculator } from 'lucide-react';
import ParametersTab from './tabs/ParametersTab';
import NematodesTab from './tabs/NematodesTab';
import AssessmentTab from './tabs/AssessmentTab';
import BacteriaTab from './tabs/BacteriaTab';
import AnalysisResults from './AnalysisResults';
import { calculateResults } from '../utils/calculations';
import { FormData, FieldData, Results, Tab } from '../types/soilAnalysis';
import { initialFormData, initialFieldData } from '../constants/defaultValues';

const SoilAnalysisForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('parameters');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [fieldData, setFieldData] = useState<FieldData>(initialFieldData);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (newFieldData: FieldData) => {
    setFieldData(newFieldData);
  };

  const handleCalculate = () => {
    setLoading(true);
    setError("");
    
    try {
      const { results: calculatedResults, warnings: calculationWarnings } = 
        calculateResults(formData, fieldData);
      
      setResults(calculatedResults);
      setWarnings(calculationWarnings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Calculation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setFieldData(initialFieldData);
    setResults(null);
    setError("");
    setSuccessMessage("");
    setWarnings([]);
  };

  const handleSaveData = () => {
    try {
      const dataToSave = { formData, fieldData };
      localStorage.setItem("soilMicroscopyData", JSON.stringify(dataToSave));
      setSuccessMessage("Data saved successfully!");
    } catch (err) {
      setError(`Failed to save data: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleLoadData = () => {
    try {
      const savedData = localStorage.getItem("soilMicroscopyData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (!parsedData.formData || !parsedData.fieldData) {
          throw new Error("Invalid saved data format.");
        }
        setFormData(parsedData.formData);
        setFieldData(parsedData.fieldData);
        setSuccessMessage("Data loaded successfully!");
      } else {
        setError("No saved data found.");
      }
    } catch (err) {
      setError(`Failed to load data: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 animate-fadeIn">
      {/* Tab navigation */}
      <div className="flex flex-wrap border-b mb-4">
        <TabButton
          active={activeTab === 'parameters'}
          onClick={() => setActiveTab('parameters')}
          label="Input Parameters"
        />
        <TabButton
          active={activeTab === 'nematodes'}
          onClick={() => setActiveTab('nematodes')}
          label="Nematode Scan"
        />
        <TabButton
          active={activeTab === 'assessment'}
          onClick={() => setActiveTab('assessment')}
          label="Main Assessment"
        />
        <TabButton
          active={activeTab === 'bacteria'}
          onClick={() => setActiveTab('bacteria')}
          label="Bacteria"
        />
      </div>

      {/* Tab content */}
      <div className="mb-6">
        {activeTab === 'parameters' && (
          <ParametersTab formData={formData} onChange={handleFormChange} />
        )}
        {activeTab === 'nematodes' && (
          <NematodesTab fieldData={fieldData} onChange={handleFieldChange} />
        )}
        {activeTab === 'assessment' && (
          <AssessmentTab 
            fieldData={fieldData} 
            onChange={handleFieldChange}
          />
        )}
        {activeTab === 'bacteria' && (
          <BacteriaTab 
            fieldData={fieldData} 
            onChange={handleFieldChange}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ActionButton 
          onClick={handleSaveData} 
          icon={<Save className="w-4 h-4 mr-2" />}
          label="Save Data"
          color="purple"
        />
        <ActionButton 
          onClick={handleLoadData} 
          icon={<Upload className="w-4 h-4 mr-2" />}
          label="Load Data"
          color="yellow"
        />
        <ActionButton 
          onClick={handleReset} 
          icon={<RotateCcw className="w-4 h-4 mr-2" />}
          label="Reset"
          color="red"
        />
        <ActionButton 
          onClick={handleCalculate} 
          icon={<Calculator className="w-4 h-4 mr-2" />}
          label={loading ? "Calculating..." : "Calculate Results"}
          color="blue"
          disabled={loading}
        />
      </div>

      {/* Status messages */}
      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-3 mb-4 bg-green-50 border border-green-200 text-green-600 rounded-md animate-fadeIn">
          {successMessage}
        </div>
      )}

      {/* Results */}
      {results && <AnalysisResults results={results} warnings={warnings} plantType={formData.plantType} />}
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label }) => (
  <button
    className={`px-4 py-2 font-medium rounded-t-lg transition-colors 
      ${active 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
    }
    onClick={onClick}
  >
    {label}
  </button>
);

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: 'blue' | 'red' | 'purple' | 'yellow';
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  onClick, icon, label, color, disabled 
}) => {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    red: 'bg-red-600 hover:bg-red-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${colorClasses[color]} 
        text-white rounded-md p-2 
        flex items-center justify-center
        transition-colors 
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {icon}
      {label}
    </button>
  );
};

export default SoilAnalysisForm;