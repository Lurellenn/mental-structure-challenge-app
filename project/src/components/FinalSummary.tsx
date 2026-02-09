import React from 'react';
import { SummaryStats } from '../utils/summaryAggregation';

interface FinalSummaryProps {
  stats: SummaryStats;
  onClose: () => void;
}

export function FinalSummary({ stats, onClose }: FinalSummaryProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-sm font-light text-gray-600">30 nap vége.</h1>
        </div>

        <div className="space-y-4 font-mono text-sm text-gray-700 mb-12">
          <div>Meghozott döntések: {stats.madDecisions}</div>
          <div>Elhalasztott döntések: {stats.postponedDecisions}</div>
          <div>Meg nem hozott döntések: {stats.unmadeDecisions}</div>
          <div>Megszegések: {stats.violations}</div>
          <div>Aktív napok: {stats.activeDays} / 30</div>
        </div>

        <button onClick={onClose} className="w-full bg-black text-white py-2 text-sm">
          Bezárás
        </button>
      </div>
    </div>
  );
}
