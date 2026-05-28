import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser, SignInButton } from '@clerk/clerk-react';

export default function UploadPage() {
  const { t, i18n } = useTranslation();
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const isZh = i18n.language === 'zh';
  const [titleZh, setTitleZh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descZh, setDescZh] = useState('');
  const [descEn, setDescEn] = useState('');
  const [difficulty, setDifficulty] = useState('moderate');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [gpxContent, setGpxContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isSignedIn) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold mb-4">{t('nav.upload')}</h1>
      <p className="text-gray-400 mb-6">{isZh ? '登录后发布徒步攻略' : 'Sign in to upload a trail guide'}</p>
      <SignInButton mode="modal"><button className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-medium">{t('nav.login')}</button></SignInButton>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleZh.trim()) return;
    setSubmitting(true); setError('');
    try {
      const meRes = await fetch(`/api/auth/me?clerkId=${user.id}`);
      const meData = await meRes.json();
      const body: any = { titleZh, titleEn: titleEn || undefined, descriptionZh: descZh || undefined, descriptionEn: descEn || undefined, difficulty, region: region || undefined, country: country || undefined, authorId: meData.id };
      if (gpxContent.trim()) body.gpxData = gpxContent;
      const res = await fetch('/api/trails/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Upload failed');
      navigate(`/trails/${(await res.json()).id}`);
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">{t('nav.upload')}</h1>
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="glass-light rounded-2xl border border-white/5 p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{isZh ? '路线名称（中文）' : 'Name (Chinese)'} *</label>
          <input type="text" value={titleZh} onChange={e => setTitleZh(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 text-sm" placeholder={isZh ? '虎跳峡高路徒步' : ''} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{isZh ? '路线名称（英文）' : 'Name (English)'}</label>
          <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 text-sm" placeholder="Tiger Leaping Gorge High Trail" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{t('trail.difficulty')}</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50">
              {['easy','moderate','hard','expert'].map(d => <option key={d} value={d}>{t(`difficulty.${d}`, d)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{t('trail.region')}</label>
            <input type="text" value={region} onChange={e => setRegion(e.target.value)} className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50" placeholder={isZh ? '云南' : 'Yunnan'} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{isZh ? '国家' : 'Country'}</label>
            <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50" placeholder={isZh ? '中国' : 'China'} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{isZh ? '描述（中文）' : 'Description (Chinese)'}</label>
          <textarea value={descZh} onChange={e => setDescZh(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{isZh ? '描述（英文）' : 'Description (English)'}</label>
          <textarea value={descEn} onChange={e => setDescEn(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{isZh ? 'GPX 轨迹（粘贴 XML）' : 'GPX Track (paste XML)'}</label>
          <textarea value={gpxContent} onChange={e => setGpxContent(e.target.value)} rows={5} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500/50 resize-none" placeholder={"<?xml version=\"1.0\"?>..."} />
        </div>
        <button type="submit" disabled={submitting || !titleZh.trim()}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold disabled:opacity-40 transition-all text-sm tracking-wide font-display">
          {submitting ? (isZh ? '发布中...' : 'Publishing...') : (isZh ? '发布攻略' : 'Publish Trail')}
        </button>
      </form>
    </div>
  );
}