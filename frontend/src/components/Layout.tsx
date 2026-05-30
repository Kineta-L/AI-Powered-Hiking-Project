import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const isPlanner = location.pathname === '/planner';
  const isHome = location.pathname === '/';

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/trails', label: t('nav.trails') },
    { path: '/planner', label: t('nav.planner') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar - glass */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-5 min-h-14 py-2 flex flex-wrap items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight">
            <img src="/kintrail-icon.jpg" alt="KinTrail" className="h-8 w-8 rounded-lg object-cover shadow-sm shadow-cyan-400/20" />
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              {t('app.title')}
            </span>
          </Link>

          <div className="order-3 w-full flex items-center gap-1 overflow-x-auto md:order-none md:w-auto md:overflow-visible">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')}
              className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {i18n.language === 'zh' ? 'EN' : '中'}
            </button>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium transition-all">
                  {t('nav.login')}
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/upload" className="text-sm px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                + {t('nav.upload')}
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Main content - no horizontal padding for planner (full-screen map) */}
      <main className={isPlanner ? 'flex-1 relative' : 'flex-1'}>{children}</main>

      {!isPlanner && (
        <footer className="border-t border-white/5 py-6 text-center text-sm text-gray-500">
          <p className="font-display inline-flex items-center justify-center gap-2">
            <img src="/kintrail-icon.jpg" alt="" className="h-5 w-5 rounded object-cover" />
            <span>KinTrail © 2026</span>
          </p>
        </footer>
      )}
    </div>
  );
}
