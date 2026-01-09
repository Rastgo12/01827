import React, { useState, useEffect } from 'react';
import { INITIAL_DATA, AppData, User, Manhua, UserRole, Chapter, GitHubConfig } from './types';
import { fetchFromGitHub, saveToGitHub } from './services/githubService';
import { Reader } from './components/Reader';
import { 
  Home, 
  BookOpen, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Database, 
  Plus, 
  Trash2, 
  Crown, 
  Lock,
  Github,
  Save
} from 'lucide-react';

// --- Local Storage Keys ---
const LS_DEVICE_ID = 'kurd_manhua_device_id';
const LS_GITHUB_CONFIG = 'kurd_manhua_gh_config';

// --- Helper Functions ---
const generateDeviceId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const App: React.FC = () => {
  // --- State ---
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'profile' | 'admin' | 'manhua'>('home');
  const [selectedManhua, setSelectedManhua] = useState<Manhua | null>(null);
  const [readingChapter, setReadingChapter] = useState<Chapter | null>(null);
  
  // Settings State
  const [ghConfig, setGhConfig] = useState<GitHubConfig>({ owner: '', repo: '', path: 'db.json', token: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Effects ---
  useEffect(() => {
    // 1. Initialize Device ID
    let devId = localStorage.getItem(LS_DEVICE_ID);
    if (!devId) {
      devId = generateDeviceId();
      localStorage.setItem(LS_DEVICE_ID, devId);
    }

    // 2. Load Configs
    const savedGh = localStorage.getItem(LS_GITHUB_CONFIG);
    if (savedGh) setGhConfig(JSON.parse(savedGh));
    
  }, []);

  // --- Actions ---

  const handleGitHubSync = async (direction: 'pull' | 'push') => {
    if (!ghConfig.token || !ghConfig.repo) {
      setStatusMsg('تکایە سەرەتا ڕێکخستنەکانی GitHub تەواو بکە.');
      return;
    }
    setIsLoading(true);
    setStatusMsg(direction === 'pull' ? 'خوێندنەوەی داتا...' : 'پاشەکەوتکردن...');
    try {
      if (direction === 'pull') {
        const { data: newData, sha } = await fetchFromGitHub(ghConfig);
        setData(newData);
        setGhConfig(prev => ({ ...prev, sha })); // Store SHA for next update
        setStatusMsg('داتا نوێکرایەوە سەرکەوتوو بوو.');
      } else {
        const newSha = await saveToGitHub(ghConfig, data);
        setGhConfig(prev => ({ ...prev, sha: newSha }));
        setStatusMsg('پاشەکەوتکردن سەرکەوتوو بوو.');
      }
    } catch (e: any) {
      setStatusMsg(`هەڵە: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = data.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const currentDeviceId = localStorage.getItem(LS_DEVICE_ID);
      
      // Device Lock Logic
      if (user.deviceId && user.deviceId !== currentDeviceId) {
        alert('ئەم ئەکاونتە لەسەر ئامێرێکی تر بەستراوەتەوە. پەیوەندی بە ئەدمین بکە.');
        return;
      }
      
      // Bind device if first time
      if (!user.deviceId) {
        const updatedUsers = data.users.map(u => 
          u.id === user.id ? { ...u, deviceId: currentDeviceId! } : u
        );
        setData({ ...data, users: updatedUsers });
        // NOTE: In real app, we would sync to DB here immediately
      }

      setCurrentUser(user);
      setView('home');
      setStatusMsg('');
    } else {
      setStatusMsg('ئیمەیڵ یان وشەی نهێنی هەڵەیە.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setView('home');
  };

  const saveSettings = () => {
    localStorage.setItem(LS_GITHUB_CONFIG, JSON.stringify(ghConfig));
    setStatusMsg('ڕێکخستنەکان پاشەکەوت کران.');
  };

  // --- Render Helpers ---

  const renderNav = () => (
    <nav className="fixed right-0 top-0 bottom-0 w-64 bg-slate-950 border-l border-slate-800 hidden md:flex flex-col p-4 z-40">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xl">K</div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">KurdManhua</h1>
      </div>

      <div className="space-y-2 flex-1">
        <button onClick={() => setView('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'home' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
          <Home size={20} /> سەرەتا
        </button>
        {currentUser && (
          <button onClick={() => setView('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <UserIcon size={20} /> پڕۆفایل
          </button>
        )}
        {currentUser && ['super_admin', 'editor'].includes(currentUser.role) && (
          <button onClick={() => setView('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <Settings size={20} /> بەڕێوەبردن
          </button>
        )}
      </div>

      {currentUser ? (
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                {currentUser.email[0].toUpperCase()}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{currentUser.email}</p>
                <p className="text-xs text-slate-500">{currentUser.role}</p>
             </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-900 px-4 py-2 rounded-lg text-sm">
            <LogOut size={16} /> دەرچوون
          </button>
        </div>
      ) : (
        <div className="pt-4 border-t border-slate-800">
           <p className="text-xs text-slate-500 mb-2 text-center">بۆ تایبەتمەندی زیاتر</p>
           <button onClick={() => setView('home')} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm">چوونەژوورەوە</button>
        </div>
      )}
    </nav>
  );

  const renderMobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 p-3 flex justify-around z-40">
        <button onClick={() => setView('home')} className={`p-2 rounded-lg ${view === 'home' ? 'text-indigo-400' : 'text-slate-500'}`}><Home /></button>
        {currentUser && <button onClick={() => setView('profile')} className={`p-2 rounded-lg ${view === 'profile' ? 'text-indigo-400' : 'text-slate-500'}`}><UserIcon /></button>}
        {currentUser && ['super_admin', 'editor'].includes(currentUser.role) && <button onClick={() => setView('admin')} className={`p-2 rounded-lg ${view === 'admin' ? 'text-indigo-400' : 'text-slate-500'}`}><Settings /></button>}
    </div>
  );

  const renderLogin = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto p-6">
      <div className="glass p-8 rounded-2xl w-full border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">چوونەژوورەوە</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">ئیمەیڵ</label>
            <input type="email" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">وشەی نهێنی</label>
            <input type="password" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors">چوونەژوورەوە</button>
        </form>
        {statusMsg && <p className="mt-4 text-center text-sm text-red-400">{statusMsg}</p>}
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="p-6 md:p-10 pb-24 md:mr-64 min-h-screen">
      {!currentUser && renderLogin()}
      
      {currentUser && (
        <>
        <header className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">مانهواکان</h2>
            <div className="bg-slate-800 px-4 py-1 rounded-full text-xs text-indigo-300 border border-indigo-900/50">
              V 1.0.0
            </div>
        </header>

        {/* Featured Slider (Simplified Grid for now) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.manhuas.map(manhua => (
              <div key={manhua.id} onClick={() => { setSelectedManhua(manhua); setView('manhua'); }} className="group cursor-pointer">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-slate-800 group-hover:border-indigo-500/50 transition-all shadow-lg">
                  <img src={manhua.coverUrl} alt={manhua.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                     <p className="text-xs text-indigo-300 font-medium mb-1">{manhua.genre[0]}</p>
                     <h3 className="text-white font-bold text-sm leading-tight">{manhua.title}</h3>
                  </div>
                  {manhua.isPremiumOnly && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Crown size={10} /> Premium
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
        </>
      )}
    </div>
  );

  const renderManhuaDetail = () => {
    if (!selectedManhua) return null;
    return (
      <div className="p-6 md:p-10 md:mr-64 pb-24 min-h-screen bg-slate-900">
        <button onClick={() => setView('home')} className="mb-6 text-slate-400 hover:text-white flex items-center gap-2">
          ← گەڕانەوە
        </button>
        
        <div className="flex flex-col md:flex-row gap-8">
           {/* Cover */}
           <div className="w-full md:w-64 flex-shrink-0">
             <img src={selectedManhua.coverUrl} alt={selectedManhua.title} className="w-full rounded-xl shadow-2xl border border-slate-700" />
             <div className="mt-4 flex gap-2">
               <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">{selectedManhua.status}</span>
               <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">{selectedManhua.views} بینین</span>
             </div>
           </div>

           {/* Info */}
           <div className="flex-1">
             <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{selectedManhua.title}</h1>
             <p className="text-slate-400 leading-relaxed mb-6">{selectedManhua.description}</p>
             <div className="flex flex-wrap gap-2 mb-8">
               {selectedManhua.genre.map(g => (
                 <span key={g} className="text-sm text-indigo-400 border border-indigo-900/50 px-3 py-1 rounded-lg">{g}</span>
               ))}
             </div>

             {/* Chapters */}
             <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
               <div className="p-4 bg-slate-800/50 border-b border-slate-800">
                 <h3 className="font-bold text-white">لیستی بەشەکان</h3>
               </div>
               <div className="divide-y divide-slate-800">
                 {selectedManhua.chapters.map(chapter => (
                   <div key={chapter.id} className="p-4 hover:bg-slate-800/50 transition-colors flex justify-between items-center group cursor-pointer" 
                        onClick={() => setReadingChapter(chapter)}>
                     <div className="flex items-center gap-3">
                       <span className="text-slate-500 text-sm">#{chapter.number}</span>
                       <span className="text-slate-200 font-medium group-hover:text-indigo-400 transition-colors">{chapter.title}</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className="text-xs text-slate-500">{new Date(chapter.createdAt).toLocaleDateString()}</span>
                       {chapter.isPremium ? <Lock size={16} className="text-yellow-500" /> : <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">Free</span>}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      </div>
    );
  };

  const renderAdmin = () => (
    <div className="p-6 md:p-10 md:mr-64 pb-24 min-h-screen">
      <h2 className="text-3xl font-bold text-white mb-8">بەڕێوەبردن</h2>
      
      <div className="max-w-2xl mx-auto">
        {/* GitHub Settings */}
        <div className="glass p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-2 mb-4 text-white">
            <Github />
            <h3 className="font-bold">پەیوەستکردنی GitHub</h3>
          </div>
          <div className="space-y-3">
             <input placeholder="Repo Owner (e.g., myuser)" className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white" value={ghConfig.owner} onChange={e => setGhConfig({...ghConfig, owner: e.target.value})} />
             <input placeholder="Repo Name (e.g., my-manhua-db)" className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white" value={ghConfig.repo} onChange={e => setGhConfig({...ghConfig, repo: e.target.value})} />
             <input placeholder="File Path (e.g., db.json)" className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white" value={ghConfig.path} onChange={e => setGhConfig({...ghConfig, path: e.target.value})} />
             <input type="password" placeholder="GitHub Personal Access Token" className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white" value={ghConfig.token} onChange={e => setGhConfig({...ghConfig, token: e.target.value})} />
             
             <div className="flex gap-2 mt-4">
               <button onClick={saveSettings} className="bg-slate-700 text-white px-4 py-2 rounded flex-1 hover:bg-slate-600">پاشەکەوتکردنی ڕێکخستن</button>
             </div>
             
             <div className="border-t border-slate-700 pt-4 flex gap-2">
                <button onClick={() => handleGitHubSync('push')} disabled={isLoading} className="bg-green-600 text-white px-4 py-2 rounded flex-1 flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50">
                  <Save size={16} /> Push to DB
                </button>
                <button onClick={() => handleGitHubSync('pull')} disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded flex-1 flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50">
                  <Database size={16} /> Pull from DB
                </button>
             </div>
          </div>
        </div>
      </div>
      
      {statusMsg && <div className="mt-6 p-4 bg-slate-800 text-indigo-300 rounded-xl border border-indigo-900/30 animate-pulse text-center">{statusMsg}</div>}
    </div>
  );

  const renderProfile = () => (
    <div className="p-6 md:p-10 md:mr-64 min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6">پڕۆفایلی بەکارهێنەر</h2>
      <div className="glass p-6 rounded-2xl border border-slate-700 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold">
            {currentUser?.email[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold">{currentUser?.email}</h3>
            <p className="text-slate-400">Role: <span className="text-indigo-400 capitalize">{currentUser?.role.replace('_', ' ')}</span></p>
            <p className="text-xs text-slate-600 mt-1">Device ID: {localStorage.getItem(LS_DEVICE_ID)?.substring(0, 8)}...</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-800">
            <span>Status</span>
            {currentUser?.isPremium ? (
              <span className="text-yellow-500 font-bold flex items-center gap-1"><Crown size={16} /> Premium Active</span>
            ) : (
              <span className="text-slate-500">Free Account</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // --- Main Render ---

  if (readingChapter) {
    // Find next/prev chapter
    const currentIdx = selectedManhua?.chapters.findIndex(c => c.id === readingChapter.id) ?? -1;
    const prevChapter = currentIdx > 0 ? selectedManhua?.chapters[currentIdx - 1] : undefined;
    const nextChapter = currentIdx !== -1 && currentIdx < (selectedManhua?.chapters.length ?? 0) - 1 
      ? selectedManhua?.chapters[currentIdx + 1] 
      : undefined;

    return (
      <Reader 
        chapter={readingChapter} 
        user={currentUser} 
        onClose={() => setReadingChapter(null)} 
        onNext={nextChapter ? () => setReadingChapter(nextChapter) : undefined}
        onPrev={prevChapter ? () => setReadingChapter(prevChapter) : undefined}
      />
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen font-sans selection:bg-indigo-500 selection:text-white">
      {renderNav()}
      {renderMobileNav()}

      <main className="transition-all duration-300">
        {view === 'home' && renderHome()}
        {view === 'manhua' && renderManhuaDetail()}
        {view === 'admin' && renderAdmin()}
        {view === 'profile' && renderProfile()}
      </main>
    </div>
  );
};

export default App;