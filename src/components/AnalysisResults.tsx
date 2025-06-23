import React from 'react';
import { Results } from '../types/soilAnalysis';
import { plantTypeOptions } from '../constants/options';

interface AnalysisResultsProps {
  results: Results;
  warnings: string[];
  plantType: string;
}

const ProgressBar: React.FC<{
  value: number;
  maxValue: number;
  threshold?: number;
  standardDeviation?: number;
  label: string;
  unit: string;
}> = ({ value, maxValue, threshold, standardDeviation, label, unit }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const isAboveThreshold = threshold ? value >= threshold : true;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">
          {value.toFixed(2)} ± {standardDeviation?.toFixed(2) || 0} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 relative">
        <div
          className={`h-4 rounded-full ${isAboveThreshold ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${percentage}%` }}
        />
        {threshold && (
          <div 
            className="absolute top-0 h-full w-0.5 bg-yellow-500"
            style={{ left: `${(threshold / maxValue) * 100}%` }}
          >
            <span className="absolute top-full mt-1 text-xs transform -translate-x-1/2 text-gray-600">
              Threshold: {threshold}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
  results, 
  warnings, 
  plantType 
}) => {
  const plantThresholds = plantTypeOptions.find(
    (opt) => opt.value === plantType
  )?.thresholds;
  
  if (!plantThresholds) {
    return <div className="text-red-600">Error: Invalid plant type</div>;
  }

  const totalProtozoa = results.flagellate + results.amoebae + results.ciliates;
  const totalProtozoaStdDev = Math.sqrt(
    Math.pow(results.flagellateStdDev, 2) + 
    Math.pow(results.amoebaeStdDev, 2) + 
    Math.pow(results.ciliatesStdDev, 2)
  );
  
  return (
    <div className="mt-8 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Results</h2>
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">Warnings</h3>
          <ul className="list-disc list-inside text-yellow-600">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Key Metrics */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Key Metrics for {plantTypeOptions.find(p => p.value === plantType)?.label}
        </h3>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <ProgressBar
            label="Bacteria Biomass"
            value={results.bacteria.micrograms}
            maxValue={plantThresholds.bacteria * 2}
            threshold={plantThresholds.bacteria}
            standardDeviation={results.bacteria.standardDeviation}
            unit="µg/g"
          />
          
          <ProgressBar
            label="Total Protozoa"
            value={totalProtozoa}
            maxValue={plantThresholds.protozoa * 2}
            threshold={plantThresholds.protozoa}
            standardDeviation={totalProtozoaStdDev}
            unit="per ml"
          />
          
          <ProgressBar
            label="Fungi to Bacteria Ratio"
            value={results.fbRatio}
            maxValue={plantThresholds.fbRatio[1] * 2}
            threshold={plantThresholds.fbRatio[0]}
            standardDeviation={results.fbRatioStdDev}
            unit=""
          />
        </div>
      </div>
      
      {/* Detailed Results */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Results</h3>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Microorganisms */}
            <div>
              <h4 className="text-lg font-medium text-gray-700 mb-3">Microorganisms</h4>
              <ProgressBar
                label="Actinobacteria"
                value={results.actinobacteria.micrograms}
                maxValue={100}
                standardDeviation={results.actinobacteria.standardDeviation}
                unit="µg/g"
              />
              <ProgressBar
                label="Fungi"
                value={results.fungi.micrograms}
                maxValue={200}
                standardDeviation={results.fungi.standardDeviation}
                unit="µg/g"
              />
              <ProgressBar
                label="Oomycetes"
                value={results.oomycetes.micrograms}
                maxValue={50}
                standardDeviation={results.oomycetes.standardDeviation}
                unit="µg/g"
              />
            </div>
            
            {/* Protozoa */}
            <div>
              <h4 className="text-lg font-medium text-gray-700 mb-3">Protozoa</h4>
              <ProgressBar
                label="Flagellates"
                value={results.flagellate}
                maxValue={10000}
                standardDeviation={results.flagellateStdDev}
                unit="per ml"
              />
              <ProgressBar
                label="Amoebae"
                value={results.amoebae}
                maxValue={5000}
                standardDeviation={results.amoebaeStdDev}
                unit="per ml"
              />
              <ProgressBar
                label="Ciliates"
                value={results.ciliates}
                maxValue={50}
                standardDeviation={results.ciliatesStdDev}
                unit="per ml"
              />
            </div>
            
            {/* Nematodes */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Nematodes</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ProgressBar
                  label="Bacterial-feeding"
                  value={results.nematodesBacterial}
                  maxValue={50}
                  unit="per ml"
                />
                <ProgressBar
                  label="Fungal-feeding"
                  value={results.nematodesFungal}
                  maxValue={50}
                  unit="per ml"
                />
                <ProgressBar
                  label="Predatory"
                  value={results.nematodesPredator}
                  maxValue={20}
                  unit="per ml"
                />
                <ProgressBar
                  label="Root-feeding"
                  value={results.nematodesRoot}
                  maxValue={10}
                  unit="per ml"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;