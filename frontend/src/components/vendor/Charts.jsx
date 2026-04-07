const DEST_COLORS = {
  'Sénégal': '#C7642D',
  France: '#D3A238',
  USA: '#5F9852',
  Autres: '#B99785',
};

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value || 0));
}

function buildDonutStyle(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      background: 'conic-gradient(#E9D5C8 0 360deg)',
    };
  }

  let start = 0;
  const parts = items.map((item) => {
    const color = DEST_COLORS[item.name] || '#B99785';
    const angle = (Number(item.percent) || 0) * 3.6;
    const end = start + angle;
    const chunk = `${color} ${start}deg ${end}deg`;
    start = end;
    return chunk;
  });

  if (start < 360) {
    parts.push(`#E9D5C8 ${start}deg 360deg`);
  }

  return {
    background: `conic-gradient(${parts.join(', ')})`,
  };
}

function WeeklyRevenueChart({ weeklyRevenue, darkMode }) {
  const max = Math.max(...weeklyRevenue.map((entry) => entry.value), 1);

  return (
    <section
      className={[
        'rounded-2xl border p-5 shadow-sm',
        darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-amber-100 bg-white',
      ].join(' ')}
    >
      <h3 className={['mb-4 text-lg font-semibold', darkMode ? 'text-amber-100' : 'text-[#2b1308]'].join(' ')}>
        Revenus hebdomadaires (FCFA)
      </h3>

      <div className="grid grid-cols-5 items-end gap-2 sm:gap-3">
        {weeklyRevenue.map((entry) => {
          const height = Math.max(18, Math.round((entry.value / max) * 160));
          return (
            <div key={entry.label} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary to-[#E5BA96]"
                style={{ height: `${height}px` }}
                title={`${entry.label}: ${formatCurrency(entry.value)} FCFA`}
              />
              <span className={darkMode ? 'text-xs text-amber-200/80' : 'text-xs text-[#7c4f2a]'}>
                {entry.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DestinationsDonut({ destinations, darkMode }) {
  const donutStyle = buildDonutStyle(destinations.items);

  return (
    <section
      className={[
        'rounded-2xl border p-5 shadow-sm',
        darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-amber-100 bg-white',
      ].join(' ')}
    >
      <h3 className={['mb-4 text-lg font-semibold', darkMode ? 'text-amber-100' : 'text-[#2b1308]'].join(' ')}>
        Destinations
      </h3>

      <div className="flex items-center gap-5">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full" style={donutStyle}>
          <div className={[
            'flex h-16 w-16 flex-col items-center justify-center rounded-full text-center',
            darkMode ? 'bg-[#2a160e] text-amber-50' : 'bg-white text-[#2b1308]',
          ].join(' ')}>
            <strong className="text-lg leading-none">{destinations.total}</strong>
            <span className="text-[10px] uppercase tracking-wide">cmd</span>
          </div>
        </div>

        <div className="space-y-2">
          {destinations.items.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DEST_COLORS[item.name] || '#B99785' }} />
              <span className={darkMode ? 'text-amber-100' : 'text-[#2b1308]'}>{item.name}</span>
              <span className={darkMode ? 'text-amber-200/70' : 'text-[#7c4f2a]'}>{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Charts({ weeklyRevenue, destinations, darkMode }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <WeeklyRevenueChart weeklyRevenue={weeklyRevenue} darkMode={darkMode} />
      </div>
      <DestinationsDonut destinations={destinations} darkMode={darkMode} />
    </div>
  );
}
