
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Text } from 'recharts';
import { AnalysisResponse, DetectionResult } from '../types';

interface ResultDisplayProps {
  result: AnalysisResponse;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const isAI = result.classification === DetectionResult.AI_GENERATED;
  const scorePercent = Math.round(result.confidence_score * 100);
  
  const data = [
    { name: 'Confidence', value: result.confidence_score },
    { name: 'Remaining', value: 1 - result.confidence_score },
  ];

  const COLORS = isAI ? ['#ef4444', '#1f2937'] : ['#22c55e', '#1f2937'];

  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-48 h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                paddingAngle={0}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{scorePercent}%</span>
            <span className="text-xs uppercase text-gray-400">Confidence</span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Classification</h3>
            <div className={`text-4xl font-black mt-1 ${isAI ? 'text-red-500' : 'text-green-500'}`}>
              {isAI ? 'AI GENERATED' : 'HUMAN VOICE'}
            </div>
          </div>

          {result.explanation && (
            <div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Analysis Breakdown</h3>
              <p className="text-gray-200 mt-2 leading-relaxed">
                {result.explanation}
              </p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <span className="bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-300">Multilingual</span>
            <span className="bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-300">Prosody Analyzed</span>
            <span className="bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-300">Artifact Check</span>
          </div>
        </div>
      </div>
    </div>
  );
};
