import { Bell, Menu, Moon, Plus, Sun } from 'lucide-react';

export default function Header({
  dateLabel,
  onCreateProduct,
  darkMode,
  onToggleDarkMode,
  pendingOrders,
  onOpenSidebar,
}) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className={[
              'mt-1 rounded-lg border px-2.5 py-2 lg:hidden',
              darkMode
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                : 'border-amber-200 bg-white text-amber-800',
            ].join(' ')}
            onClick={onOpenSidebar}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h2 className={[
              'text-3xl font-semibold',
              darkMode ? 'text-amber-100' : 'text-[#2b1308]',
            ].join(' ')}>
              Tableau de bord
            </h2>
            <p className={darkMode ? 'text-amber-200/70' : 'text-[#7c4f2a]'}>{dateLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleDarkMode}
            className={[
              'rounded-lg border px-3 py-2 transition',
              darkMode
                ? 'border-amber-600/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20'
                : 'border-amber-200 bg-white text-amber-800 hover:bg-amber-50',
            ].join(' ')}
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div
            className={[
              'relative rounded-lg border px-3 py-2',
              darkMode
                ? 'border-amber-600/40 bg-amber-500/10 text-amber-100'
                : 'border-amber-200 bg-white text-amber-800',
            ].join(' ')}
          >
            <Bell className="h-4 w-4" />
            {pendingOrders > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {pendingOrders}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onCreateProduct}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Nouveau produit
          </button>
        </div>
      </div>
    </header>
  );
}
