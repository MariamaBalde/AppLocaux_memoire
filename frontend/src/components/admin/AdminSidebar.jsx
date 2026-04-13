import { useMemo, useState } from 'react';
import {
  BarChart3,
  Grid3x3,
  Menu,
  Settings,
  ShoppingCart,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ pendingCount = 0 }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navSections = useMemo(
    () => [
      {
        title: "Vue d'ensemble",
        items: [
          { label: 'Dashboard', icon: BarChart3, path: '/admin/dashboard' },
        ],
      },
      {
        title: 'Gestion',
        items: [
          { label: 'Vendeurs', icon: Users, badge: pendingCount > 0 ? String(pendingCount) : '', path: '/admin/vendors' },
          { label: 'Clients', icon: Users, path: '/admin/clients' },
          { label: 'Commandes', icon: ShoppingCart, path: '/admin/orders' },
          { label: 'Produits', icon: Wrench, path: '/admin/products' },
        ],
      },
      {
        title: 'Systeme',
        items: [
          { label: 'Parametres', icon: Settings, path: '/admin/settings' },
        ],
      },
    ],
    [pendingCount]
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-[#180602] text-[#f2d9bd] transition-all duration-300 flex-shrink-0`}>
      <div className="flex h-full flex-col border-r border-[#2f130a]">
        <div className="border-b border-[#2f130a] px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#cf6d2f] text-xs font-semibold text-white">
                A
              </div>
              {sidebarOpen && <span className="text-3xl font-semibold text-[#f0be82]">AfriMarket</span>}
            </div>
            <button
              type="button"
              className="text-[#a88467] hover:text-[#f2d9bd]"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Basculer la sidebar"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {sidebarOpen && <p className="mt-2 text-xs uppercase tracking-[0.15em] text-[#7f5f4a]">Administration</p>}
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              {sidebarOpen && <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#7f5f4a]">{section.title}</p>}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => navigate(item.path)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                          isActive ? 'bg-[#31140b] text-[#f4d8bc]' : 'hover:bg-[#251008] text-[#d7b392]'
                        }`}
                      >
                        {item.path === '/admin/products' ? <Grid3x3 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        {sidebarOpen && <span className="text-sm">{item.label}</span>}
                        {sidebarOpen && item.badge && (
                          <span className="ml-auto rounded-full bg-[#c8652a] px-2 py-0.5 text-[11px] text-white">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#2f130a] p-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#cb6b2f] text-xs font-semibold text-white">
              AD
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-semibold">Admin Principal</p>
                <p className="text-xs text-[#8f705c]">Super administrateur</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-md border border-[#5f3824] px-3 py-2 text-left text-sm text-[#f2d9bd] transition hover:bg-[#2b1209]"
            >
              Deconnexion
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
