export interface SummaryStats {
  madDecisions: number;
  postponedDecisions: number;
  unmadeDecisions: number;
  violations: number;
  activeDays: number;
  totalDays: number;
}

const DECISION_MAPPING: Record<number, 'made' | 'postponed' | 'unmade'> = {
  1: 'made',
  2: 'made',
  3: 'postponed',
  4: 'made',
  5: 'made',
  6: 'made',
  7: 'made',
  8: 'made',
  9: 'made',
  10: 'made',
  11: 'made',
  12: 'made',
  13: 'made',
  14: 'made',
  15: 'made',
  16: 'made',
  17: 'made',
  18: 'made',
  19: 'made',
  20: 'made',
  21: 'made',
  22: 'made',
  23: 'made',
  24: 'made',
  25: 'made',
  26: 'unmade',
  27: 'made',
  28: 'made',
  29: 'made',
  30: 'unmade',
};

export function aggregateSummary(responses: Array<{ day: number; response_value: boolean | null }>): SummaryStats {
  let madDecisions = 0;
  let postponedDecisions = 0;
  let unmadeDecisions = 0;
  let violations = 0;
  let activeDays = 0;

  responses.forEach(({ day, response_value }) => {
    if (response_value === null) return;

    activeDays++;

    if (response_value === true) {
      const type = DECISION_MAPPING[day] || 'made';
      if (type === 'made') madDecisions++;
      else if (type === 'postponed') postponedDecisions++;
      else unmadeDecisions++;
    } else {
      violations++;
    }
  });

  return {
    madDecisions,
    postponedDecisions,
    unmadeDecisions,
    violations,
    activeDays,
    totalDays: responses.length,
  };
}

export function shouldShowSummary(day: number): boolean {
  return day === 8 || day === 15 || day === 22 || day === 31;
}

export function getSummaryDay(day: number): 'weekly-1' | 'weekly-2' | 'weekly-3' | 'final' | null {
  if (day === 8) return 'weekly-1';
  if (day === 15) return 'weekly-2';
  if (day === 22) return 'weekly-3';
  if (day === 31) return 'final';
  return null;
}
