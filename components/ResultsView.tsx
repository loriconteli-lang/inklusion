import React, { useMemo, useRef, useState } from 'react';
import { Indicator, Answers, AnswerValue, answerOptions, Dimension } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Add this for TS to recognize the libraries loaded via script tags in index.html
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface ResultsViewProps {
  indicators: Indicator[];
  answers: Answers;
  onRestart: () => void;
  data: Dimension[];
}

const ResultsView: React.FC<ResultsViewProps> = ({ indicators, answers, onRestart, data }) => {

  const answerLabels = useMemo(() => new Map(answerOptions.map(opt => [opt.value, opt.label])), []);
  const resultsContentRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    if (!resultsContentRef.current || !window.jspdf || !window.html2canvas) {
      console.error("PDF generation resources not ready.");
      alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;
    const input = resultsContentRef.current;
    
    // Temporarily hide buttons for the screenshot
    const buttonsContainer = input.querySelector('.print-buttons-container') as HTMLElement | null;
    if (buttonsContainer) {
      buttonsContainer.style.display = 'none';
    }

    setIsPrinting(true);

    html2canvas(input, {
      scale: 2, // Higher resolution for better quality
      useCORS: true,
      logging: false,
    })
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const imgHeight = canvasHeight / ratio;
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add new pages if content is longer than one page
      while (heightLeft > 0) {
        position = -heightLeft; // This should be negative to show the next part of the image
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('auswertung.pdf');
    })
    .catch(err => {
      console.error("Error generating PDF:", err);
      alert("Es gab einen Fehler beim Erstellen des PDFs. Bitte versuchen Sie es erneut.");
    })
    .finally(() => {
      // Show buttons again regardless of success or failure
      if (buttonsContainer) {
        buttonsContainer.style.display = 'flex';
      }
      setIsPrinting(false);
    });
  };

  const chartData = useMemo(() => {
    return indicators.map(indicator => {
      const indicatorAnswers = answers[indicator.id] || {};
      const counts = {
        [AnswerValue.Applies]: 0,
        [AnswerValue.Partially]: 0,
        [AnswerValue.NotApplies]: 0,
        [AnswerValue.NotRelevant]: 0,
      };

      indicator.questions.forEach(question => {
        const answer = indicatorAnswers[question.id];
        if (answer && counts.hasOwnProperty(answer)) {
          counts[answer]++;
        }
      });
      
      return {
        name: indicator.title,
        ...counts,
      };
    });
  }, [indicators, answers]);

  const indicatorColorMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!data) return map;
    data.forEach(dimension => {
        dimension.sections.forEach(section => {
        section.indicators.forEach(indicator => {
            map.set(indicator.id, dimension.color);
        });
        });
    });
    return map;
  }, [data]);

  const indicatorTitleMap = useMemo(() => {
      const map = new Map<string, Indicator>();
      indicators.forEach(i => map.set(i.title, i));
      return map;
  }, [indicators]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-slate-300 rounded-md shadow-lg text-sm">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any) => (
            <p key={`item-${entry.dataKey}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const CustomizedAxisTick = ({ x, y, payload }: any) => {
    const indicator = indicatorTitleMap.get(payload.value);
    const color = indicator ? indicatorColorMap.get(indicator.id) : '#475569';
    const text = payload.value;
    
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      if ((currentLine + ' ' + word).trim().length > 20 && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    });
    if (currentLine) {
      lines.push(currentLine);
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={20}
          textAnchor="middle"
          fill={color}
          style={{ fontSize: '12px', fontWeight: 500 }}
        >
          {lines.map((line, index) => (
            <tspan x="0" dy={index === 0 ? 0 : '1.2em'} key={index}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };


  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div ref={resultsContentRef} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-slate-800 text-center">Auswertung</h2>
        <p className="text-slate-600 text-center">
          Hier sehen Sie die Verteilung Ihrer Antworten für die ausgewählten Indikatoren.
        </p>

        <div style={{ width: '100%', height: 500 }} className="mt-8 chart-container">
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 150 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="name" stroke="none" interval={0} tick={<CustomizedAxisTick />} height={140} />
                    <YAxis stroke="#475569" allowDecimals={false} label={{ value: 'Anzahl Antworten', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(239, 246, 255, 0.7)'}}/>
                    <Legend />
                    <Bar dataKey={AnswerValue.Applies} name={answerLabels.get(AnswerValue.Applies)} fill="#22c55e" />
                    <Bar dataKey={AnswerValue.Partially} name={answerLabels.get(AnswerValue.Partially)} fill="#facc15" />
                    <Bar dataKey={AnswerValue.NotApplies} name={answerLabels.get(AnswerValue.NotApplies)} fill="#ef4444" />
                    <Bar dataKey={AnswerValue.NotRelevant} name={answerLabels.get(AnswerValue.NotRelevant)} fill="#9ca3af" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        
        <div className="mt-10 pt-8 border-t border-slate-200 space-y-6">
            <h3 className="text-2xl font-bold text-slate-800 text-center">
                Ihre Antworten im Detail
            </h3>
            {indicators.map(indicator => (
                <div key={indicator.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                    <h4 className="text-lg font-semibold text-slate-700 mb-3 pl-2" style={{ borderLeft: `4px solid ${indicatorColorMap.get(indicator.id) || '#cbd5e1'}` }}>
                        {indicator.title}
                    </h4>
                    <ul className="space-y-3">
                        {indicator.questions.map(question => {
                            const answerValue = answers[indicator.id]?.[question.id];
                            const answer = answerOptions.find(opt => opt.value === answerValue);
                            return (
                                <li key={question.id} className="text-sm p-3 bg-white rounded-md shadow-sm">
                                    <p className="font-medium text-slate-800">{question.text}</p>
                                    <p className="text-slate-600 mt-1">Ihre Antwort: <span className="font-semibold text-indigo-700">{answer ? answer.label : 'Nicht beantwortet'}</span></p>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
        
        <div className="pt-8 text-center flex flex-col sm:flex-row justify-center items-center gap-4 print-buttons-container">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-8 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-all transform hover:scale-105 w-full sm:w-auto disabled:bg-slate-400 disabled:cursor-wait"
            aria-label="Auswertung als PDF drucken"
          >
            {isPrinting ? 'PDF wird erstellt...' : 'Als PDF drucken'}
          </button>
          <button
            onClick={onRestart}
            disabled={isPrinting}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all transform hover:scale-105 w-full sm:w-auto disabled:bg-slate-400"
          >
            Neue Bewertung starten
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;