export default function StatsCard({ title, value, subtitle, darkMode }) {
  return (
    <article
      className={[
        'rounded-2xl border p-4 shadow-sm',
        darkMode
          ? 'border-amber-700/30 bg-[#2a160e] text-amber-100'
          : 'border-amber-100 bg-white text-[#2b1308]',
      ].join(' ')}
    >
      <p className={darkMode ? 'text-sm text-amber-200/70' : 'text-sm text-[#7c4f2a]'}>{title}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
      {subtitle && (
        <p className={[
          'mt-1 text-sm',
          darkMode ? 'text-amber-200/80' : 'text-[#5f8a2f]',
        ].join(' ')}>
          {subtitle}
        </p>
      )}
    </article>
  );
}
