import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';
import { SummaryScreen } from './components/SummaryScreen';
import { FinalSummary } from './components/FinalSummary';
import { CyclesMenu } from './components/CyclesMenu';
import { aggregateSummary, getSummaryDay, shouldShowSummary, SummaryStats } from './utils/summaryAggregation';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const CHALLENGES = {
  'belépő': {
    title: 'Belépő (3 nap)',
    days: [
      {
        day: 1,
        morning: 'Mikor nyúltál ma a telefonhoz reflexből? Írj 3 helyzetet.',
        evening: 'Volt legalább 1 pillanat, amikor észrevetted a reflexet?',
        inputType: 'choice'
      },
      {
        day: 2,
        morning: 'Válassz 1 helyzetet: várakozás / unalom / stressz. Írj 1 csere-tevékenységet 2 percre.',
        evening: 'Megcsináltad legalább egyszer a cserét?',
        inputType: 'choice'
      },
      {
        day: 3,
        morning: 'Írj 1 mondatot: mit nyertél, amikor nem nyitottad meg.',
        evening: 'Adj 1 számot: hány percet bírtál inger nélkül?',
        inputType: 'number'
      }
    ]
  },
  'döntési-diéta': {
    title: 'Döntési Diéta',
    days: [
      { day: 1, morning: 'Ma maximum 10 döntést hozhatsz. Írd le őket előre.', evening: 'Több volt, mint 10?', inputType: 'choice' },
      { day: 2, morning: 'Ma nem döntesz ételről. Az első opciót választod.', evening: 'Döntöttél mégis?', inputType: 'choice' },
      { day: 3, morning: 'Ma egy döntést kötelezően elhalasztasz holnapra.', evening: 'Sikerült a halasztás?', inputType: 'choice' },
      { day: 4, morning: 'Minden döntés előtt tarts 10 másodperc szünetet.', evening: 'Betartottad?', inputType: 'choice' },
      { day: 5, morning: 'Ma nincs optimalizálás. Az "elég jó" az egyetlen mérce.', evening: 'Optimalizáltál?', inputType: 'choice' },
      { day: 6, morning: 'Ma nem indokolsz meg döntést senkinek.', evening: 'Megmagyaráztál egyet is?', inputType: 'choice' },
      { day: 7, morning: '18:00 után tilos bármilyen (akár apró) döntést hozni.', evening: 'Tartottad a zárlatot?', inputType: 'choice' },
      { day: 8, morning: 'Ma tilos véleményt kérni másoktól a döntéseidhez.', evening: 'Kértél külső megerősítést?', inputType: 'choice' },
      { day: 9, morning: 'Ma tilos összehasonlító oldalakat/véleményeket nézni.', evening: 'Kutattál opciók után?', inputType: 'choice' },
      { day: 10, morning: 'Ma csak két opció közül választhatsz (A vagy B).', evening: 'Bevezettél harmadik opciót?', inputType: 'choice' },
      { day: 11, morning: 'Ma az első 5 percben hozd meg a nap legnehezebb döntését.', evening: 'Megvolt 09:00-ig?', inputType: 'choice' },
      { day: 12, morning: 'Ma nem használsz telefont döntéshozatali segédletként.', evening: 'Megálltad?', inputType: 'choice' },
      { day: 13, morning: 'Ma minden döntésedre maximum 60 másodperced van.', evening: 'Túllépted az időkeretet?', inputType: 'choice' },
      { day: 14, morning: 'Ma delegálj 3 döntést valaki másnak.', evening: 'Delegáltad mind a hármat?', inputType: 'choice' },
      { day: 15, morning: 'Ma ugyanazt viseld/edd/tedd, mint tegnap. Nulla változtatás.', evening: 'Változtattál a rutinon?', inputType: 'choice' },
      { day: 16, morning: 'Ma minden "Igen"-t mondasz egy előre kiválasztott témában.', evening: 'Mondtál nemet?', inputType: 'choice' },
      { day: 17, morning: 'Ma mindenre "Nem"-et mondasz, ami nem kötelező.', evening: 'Mondtál felesleges igent?', inputType: 'choice' },
      { day: 18, morning: 'Ma ne használj listákat. Ami eszedbe jut, döntsd el azonnal.', evening: 'Halogattál listára írással?', inputType: 'choice' },
      { day: 19, morning: 'Ma fixáld le a következő 3 nap reggelijét és ruháit.', evening: 'Kész a fix terv?', inputType: 'choice' },
      { day: 20, morning: 'Ma válassz egy véletlenszerű módszert (pénzfeldobás) 3 döntéshez.', evening: 'Alkalmaztad?', inputType: 'choice' },
      { day: 21, morning: 'Ma tilos visszavonni vagy megváltoztatni egy már meghozott döntést.', evening: 'Korrigáltál utólag?', inputType: 'choice' },
      { day: 22, morning: 'Ma számold össze, hány döntést hoztál meg 12:00-ig.', evening: 'Mi a szám?', inputType: 'choice' },
      { day: 23, morning: 'Ma csak olyat tégy, amit "robotpilóta" üzemmódban is tudsz.', evening: 'Megszegted a kényelmi zónát?', inputType: 'choice' },
      { day: 24, morning: 'Ma zárd le az összes függőben lévő, "majd eldöntöm" ügyedet.', evening: 'Maradt nyitott kérdésed?', inputType: 'choice' },
      { day: 25, morning: 'Ma ne kérdezz vissza. Az első utasítást/információt fogadd el.', evening: 'Kérdeztél részleteket?', inputType: 'choice' },
      { day: 26, morning: 'Ma ne válassz. Hagyd, hogy a környezeted döntsön helyetted.', evening: 'Átvetted az irányítást?', inputType: 'choice' },
      { day: 27, morning: 'Ma iktass ki egy olyan eszközt, ami döntésre kényszerít (pl. értesítések).', evening: 'Kikapcsoltad?', inputType: 'choice' },
      { day: 28, morning: 'Ma ne akarj jól dönteni. Csak dönteni akarj.', evening: 'Voltál maximalista?', inputType: 'choice' },
      { day: 29, morning: 'Ma felezd meg a tegnapi döntéseid számát.', evening: 'Sikerült a redukció?', inputType: 'choice' },
      { day: 30, morning: 'Ma ne hozz egyetlen tudatos döntést sem. Sodródj.', evening: 'Hány döntést kényszerítettél ki?', inputType: 'choice' },
    ]
  }
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [cycle, setCycle] = useState<any>(null);
  const [response, setResponse] = useState<boolean | string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showingSummary, setShowingSummary] = useState(false);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [summaryType, setSummaryType] = useState<'weekly-1' | 'weekly-2' | 'weekly-3' | 'final' | null>(null);
  const [showingCyclesMenu, setShowingCyclesMenu] = useState(false);
  const [completedBelepoCycle, setCompletedBelepoCycle] = useState(false);
  const [showingProof, setShowingProof] = useState(false);
  const [proofData, setProofData] = useState<{ yesCounts: number; minutes: number } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadCycle(session.user.id);
        checkBelepoCycleCompletion(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadCycle(session.user.id);
        checkBelepoCycleCompletion(session.user.id);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const checkBelepoCycleCompletion = async (userId: string) => {
    const { data: cycles } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_type', 'belépő')
      .isNotNull('completed_at')
      .limit(1);

    if (cycles && cycles.length > 0) {
      setCompletedBelepoCycle(true);
    }
  };

  const loadCycle = async (userId: string) => {
    const { data: cycles } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', userId)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1);

    if (cycles && cycles.length > 0) {
      setCycle(cycles[0]);
      loadResponse(cycles[0].id, cycles[0].current_day);
    }
  };

  const loadResponse = async (cycleId: string, day: number) => {
    const { data } = await supabase
      .from('responses')
      .select('response_value')
      .eq('cycle_id', cycleId)
      .eq('day', day)
      .maybeSingle();

    setResponse(data?.response_value ?? null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === 'signup') {
        await supabase.auth.signUp({ email, password });
      } else {
        await supabase.auth.signInWithPassword({ email, password });
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Auth error');
    }
  };

  const startChallenge = async (challengeType: 'belépő' | 'döntési-diéta' = 'döntési-diéta') => {
    if (!session) return;
    try {
      const { data: newCycle } = await supabase
        .from('cycles')
        .insert({ user_id: session.user.id, current_day: 1, challenge_type: challengeType })
        .select()
        .single();

      if (newCycle) {
        setCycle(newCycle);
        setResponse(null);
      }
    } catch (error) {
      alert('Error starting challenge');
    }
  };

  const saveResponse = async () => {
    if (!cycle || response === null) return;
    try {
      await supabase
        .from('responses')
        .upsert({
          cycle_id: cycle.id,
          day: cycle.current_day,
          response_value: response
        });
    } catch (error) {
      alert('Error saving response');
    }
  };

  const loadCycleResponses = async (cycleId: string) => {
    const { data } = await supabase
      .from('responses')
      .select('day, response_value')
      .eq('cycle_id', cycleId)
      .order('day');

    return data || [];
  };

  const nextDay = async () => {
    if (!cycle) return;
    await saveResponse();

    const nextDay = cycle.current_day + 1;
    const maxDays = cycle.challenge_type === 'belépő' ? 3 : 30;
    const isBelépö = cycle.challenge_type === 'belépő';

    if (nextDay > maxDays) {
      if (isBelépö) {
        const responses = await loadCycleResponses(cycle.id);
        const yesCounts = responses.filter(r => r.response_value === true).length;
        const minutesResponse = responses.find(r => r.day === 3);
        const minutes = minutesResponse ? parseInt(minutesResponse.evening_response || '0') : 0;

        await supabase
          .from('cycles')
          .update({ completed_at: new Date() })
          .eq('id', cycle.id);

        setCompletedBelepoCycle(true);
        setProofData({ yesCounts, minutes });
        setShowingProof(true);
        setCycle(null);
        setResponse(null);
      } else {
        const responses = await loadCycleResponses(cycle.id);
        const stats = aggregateSummary(responses);
        setSummaryStats(stats);
        setSummaryType('final');
        setShowingSummary(true);
      }
    } else if (!isBelépö && shouldShowSummary(nextDay)) {
      const responses = await loadCycleResponses(cycle.id);
      const stats = aggregateSummary(responses);
      const summaryDay = getSummaryDay(nextDay);
      setSummaryStats(stats);
      setSummaryType(summaryDay);
      setShowingSummary(true);
    } else {
      await supabase
        .from('cycles')
        .update({ current_day: nextDay })
        .eq('id', cycle.id);
      setCycle({ ...cycle, current_day: nextDay });
      setResponse(null);
    }
  };

  const handleSummaryContinue = async () => {
    if (!cycle) return;

    if (summaryType === 'final') {
      await supabase
        .from('cycles')
        .update({ completed_at: new Date() })
        .eq('id', cycle.id);
      setCycle(null);
      setShowingSummary(false);
      setSummaryStats(null);
      setSummaryType(null);
      setResponse(null);
    } else {
      const nextDay = cycle.current_day + 1;
      await supabase
        .from('cycles')
        .update({ current_day: nextDay })
        .eq('id', cycle.id);
      setCycle({ ...cycle, current_day: nextDay });
      setResponse(null);
      setShowingSummary(false);
      setSummaryStats(null);
      setSummaryType(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCycle(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center" />;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <form onSubmit={handleAuth} className="w-full max-w-xs">
          <h1 className="text-xl font-light mb-8 text-center">Döntési Diéta</h1>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-sm"
            />
            <input
              type="password"
              placeholder="Jelszó"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-sm"
            />
            <button
              type="submit"
              className="w-full bg-black text-white py-2 text-sm"
            >
              {authMode === 'login' ? 'Bejelentkezés' : 'Regisztráció'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="w-full mt-4 text-xs text-gray-600 underline"
          >
            {authMode === 'login' ? 'Regisztrálj' : 'Bejelentkezés'}
          </button>
        </form>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 gap-4">
        <h1 className="text-xl font-light">Döntési Diéta</h1>
        <p className="text-sm text-gray-600">30 nap. Egy szabály naponta.</p>
        <button
          onClick={() => startChallenge('döntési-diéta')}
          className="bg-black text-white px-6 py-2 text-sm mt-4"
        >
          Indítás
        </button>
        <button
          onClick={() => setShowingCyclesMenu(true)}
          className="text-xs text-gray-600 underline mt-2"
        >
          Ciklusok
        </button>
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-600 flex items-center gap-1"
        >
          <LogOut size={14} /> Kilépés
        </button>
      </div>
    );
  }

  if (showingProof && proofData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center space-y-8">
            <h1 className="text-xl font-light text-gray-800">Bizonyíték</h1>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex justify-between border-b pb-2">
                <span>Teljesítés</span>
                <span className="font-light">3/3</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Sikeres napok</span>
                <span className="font-light">{proofData.yesCounts}/3</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Percek inger nélkül</span>
                <span className="font-light">{proofData.minutes} perc</span>
              </div>
            </div>

            <div className="pt-4 text-center text-sm text-gray-600">
              Unlocked: Döntési Diéta (30 nap)
            </div>

            <button
              onClick={() => {
                setShowingProof(false);
                setProofData(null);
              }}
              className="w-full bg-black text-white py-2 text-sm mt-8"
            >
              Tovább
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showingSummary && summaryStats && summaryType) {
    if (summaryType === 'final') {
      return <FinalSummary stats={summaryStats} onClose={handleSummaryContinue} />;
    } else {
      const weekNumber = summaryType === 'weekly-1' ? 1 : summaryType === 'weekly-2' ? 2 : 3;
      return <SummaryScreen weekNumber={weekNumber} stats={summaryStats} onContinue={handleSummaryContinue} />;
    }
  }

  if (showingCyclesMenu) {
    return (
      <CyclesMenu
        activeCycle={cycle}
        completedBelepoCycle={completedBelepoCycle}
        onClose={() => setShowingCyclesMenu(false)}
        onStartChallenge={(type) => {
          setShowingCyclesMenu(false);
          startChallenge(type);
        }}
      />
    );
  }

  const challengeType = cycle.challenge_type as 'belépő' | 'döntési-diéta';
  const challenge = CHALLENGES[challengeType];
  const maxDays = challengeType === 'belépő' ? 3 : 30;
  const dayData = challenge.days.find(d => d.day === cycle.current_day);

  if (!dayData) return null;

  const isLastDay = cycle.current_day === maxDays;
  const isAnswered = response !== null && response !== '';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setShowingCyclesMenu(true)}
            className="text-xs text-gray-600 underline"
          >
            Ciklusok
          </button>
          <p className="text-xs text-gray-400">Nap {cycle.current_day}/{maxDays}</p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-sm font-light text-gray-800">{dayData.morning}</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600 block mb-4">{dayData.evening}</label>

            {dayData.inputType === 'choice' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setResponse(true)}
                  className={`flex-1 py-2 text-sm border ${
                    response === true ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  Igen
                </button>
                <button
                  onClick={() => setResponse(false)}
                  className={`flex-1 py-2 text-sm border ${
                    response === false ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  Nem
                </button>
              </div>
            ) : dayData.inputType === 'number' ? (
              <input
                type="number"
                value={typeof response === 'number' ? response : ''}
                onChange={(e) => setResponse(e.target.value ? parseInt(e.target.value) : null)}
                placeholder={dayData.placeholder || ''}
                className="w-full px-3 py-2 border border-gray-300 text-sm"
              />
            ) : (
              <textarea
                value={typeof response === 'string' ? response : ''}
                onChange={(e) => setResponse(e.target.value)}
                placeholder={dayData.placeholder || ''}
                className="w-full px-3 py-2 border border-gray-300 text-sm resize-none"
                rows={3}
              />
            )}
          </div>

          <button
            onClick={nextDay}
            disabled={!isAnswered}
            className={`w-full py-2 text-sm ${
              isAnswered ? 'bg-black text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLastDay ? 'Befejezés' : 'Kész'}
          </button>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full mt-6 text-xs text-gray-600 flex items-center justify-center gap-1"
        >
          <LogOut size={14} /> Kilépés
        </button>
      </div>
    </div>
  );
}

export default App;
