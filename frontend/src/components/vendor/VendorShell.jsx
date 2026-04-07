import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import Sidebar from './Sidebar';
import { authService } from '../../services/authService';
import { buildVendorMenuSections } from './menuConfig';

export default function VendorShell({
  activeKey,
  title,
  subtitle,
  pendingOrders = 0,
  actions = null,
  children,
}) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('vendor-dashboard-theme') === 'dark');

  const menuSections = useMemo(() => buildVendorMenuSections(pendingOrders), [pendingOrders]);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('vendor-dashboard-theme', next ? 'dark' : 'light');
  };

  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleNavigate = (item) => {
    if (item.path) navigate(item.path);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={[
        'min-h-screen',
        darkMode ? 'bg-[#140b06]' : 'bg-[#f8f4f1]',
      ].join(' ')}>
        <Sidebar
          menuSections={menuSections}
          activeKey={activeKey}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          darkMode={darkMode}
        />

        <main className="px-4 pb-8 pt-4 lg:ml-72 lg:px-8 lg:pt-8">
          <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
                type="button"
                className={[
                  'mt-1 rounded-lg border px-2.5 py-2 lg:hidden',
                  darkMode
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                    : 'border-amber-200 bg-white text-amber-800',
                ].join(' ')}
                onClick={() => setSidebarOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <h1 className={['text-3xl font-semibold', darkMode ? 'text-amber-100' : 'text-[#2b1308]'].join(' ')}>{title}</h1>
                <p className={darkMode ? 'text-amber-200/70' : 'text-[#7c4f2a]'}>{subtitle || dateLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
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

              {actions}
            </div>
          </header>

          {children({ darkMode })}
        </main>
      </div>
    </div>
  );
}
