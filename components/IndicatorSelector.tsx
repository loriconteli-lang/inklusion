
import React, { useState } from 'react';
import { Dimension } from '../types';

interface IndicatorSelectorProps {
  data: Dimension[];
  selectedIndicators: string[];
  onSelectedIndicatorsChange: (selected: string[]) => void;
  onStart: () => void;
}

const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({ data, selectedIndicators, onSelectedIndicatorsChange, onStart }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['A1']);

  const handleIndicatorToggle = (indicatorId: string) => {
    const newSelection = selectedIndicators.includes(indicatorId)
      ? selectedIndicators.filter(id => id !== indicatorId)
      : [...selectedIndicators, indicatorId];
    onSelectedIndicatorsChange(newSelection);
  };
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-slate-800 text-center">Indikatoren auswählen</h2>
        <p className="text-slate-600 text-center">
          Wählen Sie die Indikatoren aus, die Sie bewerten möchten.
        </p>
        
        <div className="space-y-4">
          {data.map(dimension =>
            dimension.sections.map(section => (
              <div key={section.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <button 
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex justify-between items-center p-4 bg-slate-100 hover:bg-slate-200 transition-colors"
                  aria-expanded={expandedSections.includes(section.id)}
                  aria-controls={`section-content-${section.id}`}
                  style={{ borderLeft: `5px solid ${dimension.color}` }}
                >
                  <h3 className="text-xl font-semibold text-slate-700 text-left">{section.title}</h3>
                  <svg className={`w-6 h-6 text-slate-500 transform transition-transform ${expandedSections.includes(section.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                
                {expandedSections.includes(section.id) && (
                  <div id={`section-content-${section.id}`} className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {section.indicators.map(indicator => (
                        <label key={indicator.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedIndicators.includes(indicator.id)}
                            onChange={() => handleIndicatorToggle(indicator.id)}
                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700">{indicator.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="pt-6 text-center">
          <button
            onClick={onStart}
            disabled={selectedIndicators.length === 0}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            Bewertung starten ({selectedIndicators.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndicatorSelector;