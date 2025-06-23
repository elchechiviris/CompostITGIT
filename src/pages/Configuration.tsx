import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Save } from 'lucide-react';
import { AppConfig } from '../types/config';

const defaultConfig: AppConfig = {
  sidebar: {
    isExpanded: true,
    activeSection: 'dashboard'
  },
  residues: {
    cnRatioThresholds: {
      highNitrogen: 15,
      green: 30
    }
  }
};

const Configuration = () => {
  const [config, setConfig] = useState<AppConfig>(() => {
    const savedConfig = localStorage.getItem('appConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = () => {
    localStorage.setItem('appConfig', JSON.stringify(config));
    setSuccessMessage('Configuration saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <Save size={20} />
          Save Changes
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
          {successMessage}
        </div>
      )}

      <Tabs.Root defaultValue="sidebar" className="bg-white rounded-lg shadow-sm">
        <Tabs.List className="flex border-b">
          <Tabs.Trigger
            value="sidebar"
            className="px-6 py-3 text-gray-600 border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600"
          >
            Sidebar
          </Tabs.Trigger>
          <Tabs.Trigger
            value="residues"
            className="px-6 py-3 text-gray-600 border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600"
          >
            Residues
          </Tabs.Trigger>
        </Tabs.List>

        <div className="p-6">
          <Tabs.Content value="sidebar">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sidebar Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.sidebar.isExpanded}
                    onChange={(e) => setConfig({
                      ...config,
                      sidebar: { ...config.sidebar, isExpanded: e.target.checked }
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">Expand sidebar by default</span>
                </label>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="residues">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Residue Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">C:N Ratio Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      High Nitrogen Threshold (0 to {config.residues.cnRatioThresholds.green})
                    </label>
                    <input
                      type="number"
                      value={config.residues.cnRatioThresholds.highNitrogen}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0 && value < config.residues.cnRatioThresholds.green) {
                          setConfig({
                            ...config,
                            residues: {
                              ...config.residues,
                              cnRatioThresholds: {
                                ...config.residues.cnRatioThresholds,
                                highNitrogen: value
                              }
                            }
                          });
                        }
                      }}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      max={config.residues.cnRatioThresholds.green - 1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Green Material Threshold (&gt; High Nitrogen)
                    </label>
                    <input
                      type="number"
                      value={config.residues.cnRatioThresholds.green}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value > config.residues.cnRatioThresholds.highNitrogen) {
                          setConfig({
                            ...config,
                            residues: {
                              ...config.residues,
                              cnRatioThresholds: {
                                ...config.residues.cnRatioThresholds,
                                green: value
                              }
                            }
                          });
                        }
                      }}
                      className="w-full border rounded-md px-3 py-2"
                      min={config.residues.cnRatioThresholds.highNitrogen + 1}
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Values above Green Material Threshold are automatically considered Brown Material
                </p>
              </div>
            </div>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
};

export default Configuration;