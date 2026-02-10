import React from 'react';
import { SummaryStats } from '../utils/summaryAggregation';

interface SummaryScreenProps {
  weekNumber: number;
  stats: SummaryStats;
  onContinue: () => void;
}

export function SummaryScreen({ weekNumber, stats, onContinue }: SummaryScreenProps) {
  const dayLabel = weekNumber === 1 ? '7. nap vége' : weekNumber === 2 ? '14. nap vége' : '21. nap vége';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-sm font-light text-gray-600">{dayLabel}</h1>
        </div>

        <div className="space-y-4 font-mono text-sm text-gray-700 mb-12">
          <div>Meghozott döntések: {stats.madDecisions}</div>
          <div>Elhalasztott döntések: {stats.postponedDecisions}</div>
          <div>Megszegések: {stats.violations}</div>
          <div>Aktív napok: {stats.activeDays} / {weekNumber === 1 ? 7 : weekNumber === 2 ? 14 : 21}</div>
        </div>

        <button onClick={onContinue} className="w-full bg-black text-white py-2 text-sm">
          Tovább
        </button>
      </div>
    </div>
  );
}
