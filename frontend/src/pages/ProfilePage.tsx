import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser, SignInButton } from '@clerk/clerk-react';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, isSignedIn } = useUser();
  const isZh = i18n.language === 'zh';
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [tab, setTab] = useState<'favorites' | 'plans'>('favorites');

  useEffect(() => {
    if (user) {
      fetch(`/api/auth/me?clerkId=${user.id}`).then(r => r.json()).then(d => {
        setUserId(d.id);
        fetch(`/api/auth/favorites?userId=${d.id}`).then(r => r.json()).then(setFavorites);
        fetch(`/api/ai/sessions?userId=${d.id}`).then(r => r.json()).then(setSessions);
      });
    }
  }, [user]);

  if (!isSignedIn) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold mb-4">{t('nav.profile')}</h1>
      <p className="text-gray-400 mb-6">{isZh ? '登录后查看个人中心' : 'Sign in to view your profile'}</p>
      <SignInButton mode="modal"><button className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-medium">{t('nav.login')}</button></SignInButton>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass-light rounded-2xl border border-white/5 p-6 mb-8 flex items-center gap-4">
        <img src={user.imageUrl} alt="" className="w-16 h-16 rounded-full ring-2 ring-amber-500/20" />
        <div>
          <h1 className="font-display text-xl font-bold">{user.fullName || user.username || 'User'}</h1>
          <p className="text-sm text-gray-400">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 glass rounded-xl p-1 border border-white/5">
        <button onClick={() => setTab('favorites')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'favorites' ? 'bg-amber-500/15 text-amber-400' : 'text-gray-400 hover:text-white'}`}>❤️ {isZh ? '收藏' : 'Favorites'} ({favorites.length})</button>
        <button onClick={() => setTab('plans')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'plans' ? 'bg-amber-500/15 text-amber-400' : 'text-gray-400 hover:text-white'}`}>🧠 {isZh ? 'AI 历史' : 'AI Plans'} ({sessions.length})</button>
      </div>

      {tab === 'favorites' && (favorites.length === 0 ? <p className="text-center text-gray-500 py-12">{isZh ? '还没有收藏任何路线' : 'No favorites yet'}</p> : (
        <div className="space-y-3">
          {favorites.map(f => (
            <Link key={f.id} to={`/trails/${f.trail.id}`} className="block glass-light rounded-xl border border-white/5 p-4 hover:border-amber-500/20 transition-colors">
              <h3 className="font-medium">{f.trail.titleZh}</h3>
              <p className="text-xs text-gray-500">{f.trail.titleEn}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-500"><span>{f.trail.region || f.trail.country}</span><span>⭐ {f.trail._count.reviews}</span></div>
            </Link>
          ))}
        </div>
      ))}

      {tab === 'plans' && (sessions.length === 0 ? <p className="text-center text-gray-500 py-12">{isZh ? '还没有 AI 规划记录' : 'No AI plans yet'}</p> : (
        <div className="space-y-3">
          {sessions.map(s => {
            const inp = JSON.parse(s.input || '{}');
            return (
              <div key={s.id} className="glass-light rounded-xl border border-white/5 p-4">
                <h3 className="font-medium">{inp?.destination || 'Unknown'}</h3>
                <div className="flex gap-3 mt-1 text-xs text-gray-500"><span>{inp?.days} {isZh ? '天' : 'd'}</span><span>{inp?.fitness}</span><span>{new Date(s.createdAt).toLocaleDateString()}</span></div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}