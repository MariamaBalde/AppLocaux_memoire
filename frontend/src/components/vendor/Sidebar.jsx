import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function sectionLabelClass(darkMode) {
  return darkMode ? 'text-amber-300/70' : 'text-amber-900/50';
}

export default function Sidebar({
  menuSections,
  activeKey,
  onNavigate,
  isOpen,
  onClose,
  user,
  darkMode,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      onClose();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-label="Fermer le menu"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300',
          darkMode ? 'bg-[#1d0f08] text-amber-50' : 'bg-[#2b1308] text-amber-50',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-amber-800/40 px-5 py-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-amber-100">AfriMarket</h1>
                <p className="mt-1 text-sm text-amber-200/70">Espace vendeur</p>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-amber-100/70 hover:bg-amber-800/30 lg:hidden"
                onClick={onClose}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            {menuSections.map((section) => (
              <div key={section.title} className="mb-6">
                <p className={`mb-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] ${sectionLabelClass(darkMode)}`}>
                  {section.title}
                </p>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeKey === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          onNavigate(item);
                          onClose();
                        }}
                        className={[
                          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition',
                          isActive
                            ? 'bg-amber-700/40 text-amber-50'
                            : 'text-amber-100/75 hover:bg-amber-700/20 hover:text-amber-50',
                        ].join(' ')}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </span>
                        {item.badge > 0 && (
                          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-amber-950">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-amber-800/40 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-sm font-semibold text-white">
                {(user?.name || 'V').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-amber-50">{user?.name || 'Vendeur'}</p>
                <p className="text-xs text-amber-100/70">Vendeur vérifié</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
