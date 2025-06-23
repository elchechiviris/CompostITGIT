import React from 'react';
import SoilAnalysisForm from '../components/SoilAnalysisForm';

const Microbiology = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Soil Microscopy Analysis</h1>
      <SoilAnalysisForm />
    </div>
  );
};

export default Microbiology;