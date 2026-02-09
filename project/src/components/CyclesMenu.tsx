import React from 'react';

interface CyclesMenuProps {
  activeCycle: {
    current_day: number;
  } | null;
  onClose: () => void;
}

export function CyclesMenu({ activeCycle, onClose }: CyclesMenuProps) {
  const cycleProgress = activeCycle
    ? `Nap ${activeCycle.current_day} / 30`
    : null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-sm font-light text-gray-600">Ciklusok</h1>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xs text-gray-500 mb-3">Aktív:</h2>
            {activeCycle ? (
              <p className="text-sm text-gray-700">{cycleProgress}</p>
            ) : (
              <p className="text-sm text-gray-400">–</p>
            )}
          </div>

          <div>
            <h2 className="text-xs text-gray-500 mb-3">Elérhető később:</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>7 nap</p>
              <p>14 nap</p>
              <p>30 nap</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-12 bg-black text-white py-2 text-sm"
        >
          Vissza
        </button>
      </div>
    </div>
  );
}
