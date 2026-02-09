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

const CHALLENGE_DATA = {
  id: 'decision_diet',
  title: 'Döntési Diéta',
  days: [
    { day: 1, morning: 'Ma maximum 10 döntést hozhatsz. Írd le őket előre.', evening: 'Több volt, mint 10?' },
    { day: 2, morning: 'Ma nem döntesz ételről. Az első opciót választod.', evening: 'Döntöttél mégis?' },
    { day: 3, morning: 'Ma egy döntést kötelezően elhalasztasz holnapra.', evening: 'Sikerült a halasztás?' },
    { day: 4, morning: 'Minden döntés előtt tarts 10 másodperc szünetet.', evening: 'Betartottad?' },
    { day: 5, morning: 'Ma nincs optimalizálás. Az "elég jó" az egyetlen mérce.', evening: 'Optimalizáltál?' },
    { day: 6, morning: 'Ma nem indokolsz meg döntést senkinek.', evening: 'Megmagyaráztál egyet is?' },
    { day: 7, morning: '18:00 után tilos bármilyen (akár apró) döntést hozni.', evening: 'Tartottad a zárlatot?' },
    { day: 8, morning: 'Ma tilos véleményt kérni másoktól a döntéseidhez.', evening: 'Kértél külső megerősítést?' },
    { day: 9, morning: 'Ma tilos összehasonlító oldalakat/véleményeket nézni.', evening: 'Kutattál opciók után?' },
    { day: 10, morning: 'Ma csak két opció közül választhatsz (A vagy B).', evening: 'Bevezettél harmadik opciót?' },
    { day: 11, morning: 'Ma az első 5 percben hozd meg a nap legnehezebb döntését.', evening: 'Megvolt 09:00-ig?' },
    { day: 12, morning: 'Ma nem használsz telefont döntéshozatali segédletként.', evening: 'Megálltad?' },
    { day: 13, morning: 'Ma minden döntésedre maximum 60 másodperced van.', evening: 'Túllépted az időkeretet?' },
    { day: 14, morning: 'Ma delegálj 3 döntést valaki másnak.', evening: 'Delegáltad mind a hármat?' },
    { day: 15, morning: 'Ma ugyanazt viseld/edd/tedd, mint tegnap. Nulla változtatás.', evening: 'Változtattál a rutinon?' },
    { day: 16, morning: 'Ma minden "Igen"-t mondasz egy előre kiválasztott témában.', evening: 'Mondtál nemet?' },
    { day: 17, morning: 'Ma mindenre "Nem"-et mondasz, ami nem kötelező.', evening: 'Mondtál felesleges igent?' },
    { day: 18, morning: 'Ma ne használj listákat. Ami eszedbe jut, döntsd el azonnal.', evening: 'Halogattál listára írással?' },
    { day: 19, morning: 'Ma fixáld le a következő 3 nap reggelijét és ruháit.', evening: 'Kész a fix terv?' },
    { day: 20, morning: 'Ma válassz egy véletlenszerű módszert (pénzfeldobás) 3 döntéshez.', evening: 'Alkalmaztad?' },
    { day: 21, morning: 'Ma tilos visszavonni vagy megváltoztatni egy már meghozott döntést.', evening: 'Korrigáltál utólag?' },
    { day: 22, morning: 'Ma számold össze, hány döntést hoztál meg 12:00-ig.', evening: 'Mi a szám?' },
    { day: 23, morning: 'Ma csak olyat tégy, amit "robotpilóta" üzemmódban is tudsz.', evening: 'Megszegted a kényelmi zónát?' },
    { day: 24, morning: 'Ma zárd le az összes függőben lévő, "majd eldöntöm" ügyedet.', evening: 'Maradt nyitott kérdésed?' },
    { day: 25, morning: 'Ma ne kérdezz vissza. Az első utasítást/információt fogadd el.', evening: 'Kérdeztél részleteket?' },
    { day: 26, morning: 'Ma ne válassz. Hagyd, hogy a környezeted döntsön helyetted.', evening: 'Átvetted az irányítást?' },
    { day: 27, morning: 'Ma iktass ki egy olyan eszközt, ami döntésre kényszerít (pl. értesítések).', evening: 'Kikapcsoltad?' },
    { day: 28, morning: 'Ma ne akarj jól dönteni. Csak dönteni akarj.', evening: 'Voltál maximalista?' },
    { day: 29, morning: 'Ma felezd meg a tegnapi döntéseid számát.', evening: 'Sikerült a redukció?' },
    { day: 30, morning: 'Ma ne hozz egyetlen tudatos döntést sem. Sodródj.', evening: 'Hány döntést kényszerítettél ki?' },
  ]
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [cycle, setCycle] = useState<any>(null);
  const [response, setResponse] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showingSummary, setShowingSummary] = useState(false);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [summaryType, setSummaryType] = useState<'weekly-1' | 'weekly-2' | 'weekly-3' | 'final' | null>(null);
  const [showingCyclesMenu, setShowingCyclesMenu] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadCycle(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadCycle(session.user.id);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

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

  const startChallenge = async () => {
    if (!session) return;
    try {
      const { data: newCycle } = await supabase
        .from('cycles')
        .insert({ user_id: session.user.id, current_day: 1 })
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

    if (nextDay > 30) {
      const responses = await loadCycleResponses(cycle.id);
      const stats = aggregateSummary(responses);
      setSummaryStats(stats);
      setSummaryType('final');
      setShowingSummary(true);
    } else if (shouldShowSummary(nextDay)) {
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
          onClick={startChallenge}
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

  if (showingSummary && summaryStats && summaryType) {
    if (summaryType === 'final') {
      return <FinalSummary stats={summaryStats} onClose={handleSummaryContinue} />;
    } else {
      const weekNumber = summaryType === 'weekly-1' ? 1 : summaryType === 'weekly-2' ? 2 : 3;
      return <SummaryScreen weekNumber={weekNumber} stats={summaryStats} onContinue={handleSummaryContinue} />;
    }
  }

  if (showingCyclesMenu) {
    return <CyclesMenu activeCycle={cycle} onClose={() => setShowingCyclesMenu(false)} />;
  }

  const dayData = CHALLENGE_DATA.days.find(d => d.day === cycle.current_day);
  if (!dayData) return null;

  const isLastDay = cycle.current_day === 30;
  const isAnswered = response !== null;

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
          <p className="text-xs text-gray-400">Nap {cycle.current_day}/30</p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-sm font-light text-gray-800">{dayData.morning}</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600 block mb-4">{dayData.evening}</label>
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
