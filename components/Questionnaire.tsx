
import React, { useState, useMemo } from 'react';
import { Indicator, Answers, AnswerValue, answerOptions, Question, Dimension } from '../types';

interface QuestionnaireProps {
  indicators: Indicator[];
  answers: Answers;
  onAnswerChange: (indicatorId: string, questionId: string, value: AnswerValue) => void;
  onSubmit: () => void;
  onBack: () => void;
  data: Dimension[];
}

interface FlatQuestion {
  question: Question;
  indicatorId: string;
  indicatorTitle: string;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ indicators, answers, onAnswerChange, onSubmit, onBack, data }) => {
  const allQuestions = useMemo((): FlatQuestion[] => {
    return indicators.flatMap(indicator =>
      indicator.questions.map(question => ({
        question,
        indicatorId: indicator.id,
        indicatorTitle: indicator.title,
      }))
    );
  }, [indicators]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const totalQuestions = allQuestions.length;

  if (totalQuestions === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800">Keine Fragen für die ausgewählten Indikatoren gefunden.</h2>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow-md hover:bg-slate-300 transition-all"
          >
            Zurück zur Auswahl
          </button>
        </div>
      </div>
    );
  }

  const { question, indicatorId, indicatorTitle } = allQuestions[currentQuestionIndex];

  const dimensionColor = useMemo(() => {
    if (!data || !indicatorId) return '#6366f1'; // default indigo
    for (const dimension of data) {
      for (const section of dimension.sections) {
        if (section.indicators.some(ind => ind.id === indicatorId)) {
          return dimension.color;
        }
      }
    }
    return '#6366f1'; // default indigo
  }, [data, indicatorId]);

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <h2 className="text-3xl font-bold text-slate-800 text-center">Fragebogen</h2>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-slate-700">Fortschritt</span>
            <span className="text-sm font-medium text-slate-700">{currentQuestionIndex + 1} / {totalQuestions}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: dimensionColor }}></div>
          </div>
        </div>

        <div className="p-6 border border-slate-200 rounded-lg min-h-[300px] flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-slate-500 mb-2">{indicatorTitle}</h3>
          <p className="text-xl text-slate-800 font-medium mb-4">{question.text}</p>
          <fieldset className="mt-2">
            <legend className="sr-only">Choose an option for question {question.id}</legend>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-4 space-y-2 sm:space-y-0">
              {answerOptions.map(option => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-slate-50">
                  <input
                    type="radio"
                    name={`${indicatorId}-${question.id}`}
                    value={option.value}
                    checked={answers[indicatorId]?.[question.id] === option.value}
                    onChange={(e) => onAnswerChange(indicatorId, question.id, e.target.value as AnswerValue)}
                    className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
           <button
            onClick={onBack}
            className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-300 transition-all transform hover:scale-105 w-full sm:w-auto order-3 sm:order-1"
          >
            Zurück zur Auswahl
          </button>
          
          <div className="flex gap-4 w-full sm:w-auto order-1 sm:order-2">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1 px-8 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-100 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all transform hover:scale-105"
            >
              Zurück
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all transform hover:scale-105"
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Auswertung anzeigen' : 'Weiter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;