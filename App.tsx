import React, { useState, useMemo } from 'react';
import IndicatorSelector from './components/IndicatorSelector';
import Questionnaire from './components/Questionnaire';
import ResultsView from './components/ResultsView';
import { schoolData } from './data/schoolData';
import { Answers, AnswerValue } from './types';

type AppState = 'selection' | 'questionnaire' | 'results';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('selection');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answers>({});

  const handleStartQuestionnaire = () => {
    if (selectedIndicators.length > 0) {
      setAppState('questionnaire');
    }
  };

  const handleAnswerChange = (indicatorId: string, questionId: string, value: AnswerValue) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [indicatorId]: {
        ...prevAnswers[indicatorId],
        [questionId]: value,
      },
    }));
  };

  const handleSubmit = () => {
    setAppState('results');
  };

  const handleRestart = () => {
    setSelectedIndicators([]);
    setAnswers({});
    setAppState('selection');
  };

  const currentIndicators = useMemo(() => {
    return schoolData
      .flatMap(d => d.sections)
      .flatMap(s => s.indicators)
      .filter(i => selectedIndicators.includes(i.id));
  }, [selectedIndicators]);
  
  const renderContent = () => {
    switch (appState) {
      case 'questionnaire':
        return (
          <Questionnaire 
            indicators={currentIndicators} 
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmit}
            onBack={handleRestart}
            data={schoolData}
          />
        );
      case 'results':
        return (
          <ResultsView 
            indicators={currentIndicators} 
            answers={answers}
            onRestart={handleRestart}
            data={schoolData}
          />
        );
      case 'selection':
      default:
        return (
          <IndicatorSelector 
            data={schoolData} 
            selectedIndicators={selectedIndicators} 
            onSelectedIndicatorsChange={setSelectedIndicators}
            onStart={handleStartQuestionnaire}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col items-center py-10">
      <header className="text-center mb-10 px-4 print:hidden">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800">
          Tool zur Selbstbewertung der Inklusivität
        </h1>
        <p className="mt-2 text-lg text-slate-600">Für Lehrpersonen und Schulen</p>
      </header>
      <main className="w-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;