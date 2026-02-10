import React from 'react';

interface CyclesMenuProps {
  activeCycle: {
    current_day: number;
    challenge_type: string;
  } | null;
  completedBelepoCycle: boolean;
  onClose: () => void;
  onStartChallenge: (type: 'belépő' | 'döntési-diéta') => void;
}

export function CyclesMenu({ activeCycle, completedBelepoCycle, onClose, onStartChallenge }: CyclesMenuProps) {
  const isActiveBelépő = activeCycle?.challenge_type === 'belépő';
  const isActiveDöntési = activeCycle?.challenge_type === 'döntési-diéta';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-sm font-light text-gray-600">Ciklusok</h1>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xs text-gray-500 mb-4">Programok:</h2>
            <div className="space-y-3">
              <button
                onClick={() => onStartChallenge('belépő')}
                disabled={activeCycle !== null}
                className={`w-full text-left py-2 px-3 text-sm border ${
                  isActiveBelépő
                    ? 'bg-gray-50 border-gray-300 text-gray-700'
                    : activeCycle !== null
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>3 nap</span>
                  {isActiveBelépő && <span className="text-xs text-gray-500">Nap {activeCycle?.current_day}/3</span>}
                </div>
              </button>

              <div className="py-2 px-3 text-sm border border-gray-200 text-gray-400">
                <div className="flex justify-between items-center">
                  <span>7 nap</span>
                  <span className="text-xs text-gray-400">zárolva</span>
                </div>
              </div>

              <div className="py-2 px-3 text-sm border border-gray-200 text-gray-400">
                <div className="flex justify-between items-center">
                  <span>14 nap</span>
                  <span className="text-xs text-gray-400">zárolva</span>
                </div>
              </div>

              <button
                onClick={() => onStartChallenge('döntési-diéta')}
                disabled={activeCycle !== null || !completedBelepoCycle}
                className={`w-full text-left py-2 px-3 text-sm border ${
                  isActiveDöntési
                    ? 'bg-gray-50 border-gray-300 text-gray-700'
                    : !completedBelepoCycle || activeCycle !== null
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>30 nap – Döntési Diéta</span>
                  {isActiveDöntési && <span className="text-xs text-gray-500">Nap {activeCycle?.current_day}/30</span>}
                  {!isActiveDöntési && !completedBelepoCycle && <span className="text-xs text-gray-400">zárolva</span>}
                </div>
              </button>
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
